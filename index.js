'use strict';

var RSVP = require('rsvp');
var fs = require('fs');
var tunnelSsh = require('tunnel-ssh');
var untildify = require('untildify');

var DeployPluginBase = require('ember-cli-deploy-plugin');

var MAX_PORT_NUMBER = 65535;
var MIN_PORT_NUMBER = 49151;

module.exports = {
  name: 'ember-cli-deploy-ssh-tunnel',

  createDeployPlugin: function(options) {
    var DeployPlugin = DeployPluginBase.extend({
      name: options.name,
      defaultConfig: {
          dstPort: 6379,
          port: 22,
          dstHost: 'localhost',
          srcPort: function() {
            var range = MAX_PORT_NUMBER - MIN_PORT_NUMBER + 1;
            return Math.floor(Math.random() * range) + MIN_PORT_NUMBER;
          },
          tunnelClient: function(context) {
            // if you want to provide your own ssh client to be used instead of one from this plugin
            return context.tunnelClient || tunnelSsh;
          }
      },

      requiredConfig: ['host', 'username'],

      setup: function(/* context */) {
        var srcPort = this.readConfig('srcPort');

        if (srcPort > MAX_PORT_NUMBER || srcPort < MIN_PORT_NUMBER) {
          throw 'Port ' + srcPort + ' is not available to open a SSH connection on.\n' + 'Please choose a port between ' + MIN_PORT_NUMBER + ' and ' + MAX_PORT_NUMBER + '.';
        }

        var sshConfig = {
          host: this.readConfig('host'),
          port: this.readConfig('port'),
          dstPort: this.readConfig('dstPort'),
          dstHost: this.readConfig('dstHost'),
          username: this.readConfig('username'),
          localPort: srcPort
        };

        var password = this.readConfig('password');
        var privateKey = this.readConfig('privateKeyPath');
        var tunnel = this.readConfig('tunnelClient');

        if (password) {
          sshConfig.password = password;
        } else if (privateKey) {
          sshConfig.privateKey = fs.readFileSync(untildify(privateKey));
        }

        return new RSVP.Promise(function(resolve, reject) {
          var sshTunnel = tunnel(sshConfig, function(error /*, result */) {
            if (error) {
              reject(error);
            } else {
              resolve({
                tunnel: {
                  handler: sshTunnel,
                  srcPort: srcPort
                }
              });
            }
          });
        });
      },

      teardown: function(context) {
        context.tunnel.handler.close();
      }
    });
    return new DeployPlugin();
  }
};
