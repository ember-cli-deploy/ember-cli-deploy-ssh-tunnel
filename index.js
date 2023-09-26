'use strict';

const RSVP = require('rsvp');
const fs = require('fs');
const { createTunnel } = require('tunnel-ssh');
const untildify = require('untildify');

const DeployPluginBase = require('ember-cli-deploy-plugin');

const MAX_PORT_NUMBER = 65535;
const MIN_PORT_NUMBER = 49151;

module.exports = {
  name: 'ember-cli-deploy-ssh-tunnel',

  createDeployPlugin: function (options) {
    const DeployPlugin = DeployPluginBase.extend({
      name: options.name,
      defaultConfig: {
        dstPort: 6379,
        port: 22,
        dstHost: 'localhost',
        srcPort: function () {
          var range = MAX_PORT_NUMBER - MIN_PORT_NUMBER + 1;
          return Math.floor(Math.random() * range) + MIN_PORT_NUMBER;
        },
        tunnelClient: function (context) {
          // if you want to provide your own ssh client to be used instead of one from this plugin,
          // must follow this signature 
          // createTunnel(
          //   tunnelOptions: TunnelOptions,
          //   serverOptions: ServerOptions,
          //   sshOptions: SshOptions,
          //   forwardOptions: ForwardOptions
          // ): Promise<[Server, Client]>;
          // https://github.com/agebrock/tunnel-ssh/blob/master/types/index.d.ts
          return context.tunnelClient || createTunnel;
        }
      },

      requiredConfig: ['host', 'username'],

      setup: function (/* context */) {
        const srcPort = this.readConfig('srcPort');

        if (srcPort > MAX_PORT_NUMBER || srcPort < MIN_PORT_NUMBER) {
          throw (
            'Port ' +
            srcPort +
            ' is not available to open a SSH connection on.\n' +
            'Please choose a port between ' +
            MIN_PORT_NUMBER +
            ' and ' +
            MAX_PORT_NUMBER +
            '.'
          );
        }

        const tunnel = this.readConfig('tunnelClient');

        let privateKey = this.readConfig('privateKey');

        if (this.readConfig('privateKeyPath')) {
          privateKey = fs.readFileSync(untildify(this.readConfig('privateKeyPath')));
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
          password: this.readConfig('password'),
          privateKey,
          passphrase: this.readConfig('passphrase')
        };

        const forwardOptions = {
          srcAddr: 'localhost',
          srcPort: this.readConfig('srcPort'),
          dstAddr: this.readConfig('dstHost'),
          dstPort: this.readConfig('dstPort')
        };

        return new RSVP.Promise(function (resolve, reject) {
          tunnel(tunnelOptions, serverOptions, sshOptions, forwardOptions)
            .then(([server]) => {
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

      teardown: function (context) {
        context.tunnel.handler.close();
      }
    });
    return new DeployPlugin();
  }
};
