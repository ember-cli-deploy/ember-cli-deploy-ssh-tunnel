'use strict';

var RSVP = require('rsvp');
var fs = require('fs');
var { createTunnel } = require('tunnel-ssh');
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
      },

      requiredConfig: ['host', 'username'],

      setup: function(/* context */) {
        var srcPort = this.readConfig('srcPort');

        if (srcPort > MAX_PORT_NUMBER || srcPort < MIN_PORT_NUMBER) {
          throw 'Port ' + srcPort + ' is not available to open a SSH connection on.\n' + 'Please choose a port between ' + MIN_PORT_NUMBER + ' and ' + MAX_PORT_NUMBER + '.';
        }

        const tunnelOptions = {
          autoClose: true
        };

        const serverOptions = {
          port: srcPort
        };

        const sshOptions = {
          host: this.readConfig('host'),
          port: this.readConfig('port'),
          username: this.readConfig('username'),
          privateKey: fs.readFileSync(untildify(this.readConfig('privateKeyPath')))
        };

        const forwardOptions = {
          srcAddr: 'localhost',
          srcPort: this.readConfig('srcPort'),
          dstAddr: this.readConfig('dstHost'),
          dstPort: this.readConfig('dstPort')
        };

        return new RSVP.Promise(function(resolve, reject) {
          createTunnel(tunnelOptions, serverOptions, sshOptions, forwardOptions)
            .then(([server, conn]) => {
              resolve({
                tunnel: {
                  handler: server,
                  srcPort: srcPort
                }
              });
            })
            .catch((error) => {
              reject(error);
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
