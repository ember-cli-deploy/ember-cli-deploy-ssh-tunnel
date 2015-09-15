'use strict';

var Promise = require('ember-cli/lib/ext/promise');
var assert  = require('ember-cli/tests/helpers/assert');
var fs  = require('fs');
var path  = require('path');

describe('ssh-tunnel plugin', function() {
  var subject, mockUi;

  beforeEach(function() {
    subject = require('../../index');
    mockUi = {
      messages: [],
      write: function() { },
      writeLine: function(message) {
        this.messages.push(message);
      }
    };
  });

  it('has a name', function() {
    var result = subject.createDeployPlugin({
      name: 'test-plugin'
    });

    assert.equal(result.name, 'test-plugin');
  });

  it('implements the correct hooks', function() {
    var result = subject.createDeployPlugin({
      name: 'test-plugin'
    });

    assert.equal(typeof result.defaultConfig, 'object');
    assert.equal(typeof result.requiredConfig, 'object');
    assert.equal(typeof result.setup, 'function');
    assert.equal(typeof result.teardown, 'function');
  });

  describe('configure hook', function() {

    it('resolves if config is ok', function() {
      var plugin = subject.createDeployPlugin({
        name: 'ssh-tunnel'
      });

      var context = {
        ui: mockUi,
        config: {
          'ssh-tunnel': {
            host: 'example.com',
            username: 'ghedamat'
          }
        }
      };

      plugin.beforeHook(context);
      plugin.configure(context);
      assert.ok(true); // it didn't throw
    });

    describe('without providing config', function () {
      var plugin, context, config;

      beforeEach(function() {
        plugin = subject.createDeployPlugin({
          name: 'ssh-tunnel'
        });
      });

      it('raises about missing required config', function() {
        config = { };
        context = {
          ui: mockUi,
          config: config
        };
        plugin.beforeHook(context);
        assert.throws(function(error){
          plugin.configure(context);
        });
        var messages = mockUi.messages.reduce(function(previous, current) {
          if (/- Missing required config:\s.*/.test(current)) {
previous.push(current);
          }

          return previous;
        }, []);
        assert.equal(messages.length, 1);
      });

      it('warns about missing optional config', function() {
        context = {
          ui: mockUi,
          config: {
            'ssh-tunnel': {
              host: 'example.com',
              username: 'ghedamat'
            }
          }
        };
        plugin.beforeHook(context);
        plugin.configure(context);
        var messages = mockUi.messages.reduce(function(previous, current) {
          if (/- Missing config:\s.*, using default:\s/.test(current)) {
            previous.push(current);
          }

          return previous;
        }, []);
        assert.equal(messages.length, 5);
      });

      it('adds default config to the config object', function() {
        context = {
          ui: mockUi,
          config: {
            'ssh-tunnel': {
              host: 'example.com',
              username: 'ghedamat'
            }
          }
        };
        plugin.beforeHook(context);
        plugin.configure(context);
        assert.isDefined(config['ssh-tunnel'].dstPort);
        assert.isDefined(config['ssh-tunnel'].dstHost);
        assert.isDefined(config['ssh-tunnel'].srcPort);
        assert.isDefined(config['ssh-tunnel'].tunnelClient);
        assert.isDefined(config['ssh-tunnel'].privateKeyPath);
      });
    });
  });

  describe('setup hook', function() {
    var plugin;
    var context;

    beforeEach(function() {
      plugin = subject.createDeployPlugin({
        name: 'ssh-tunnel'
      });

      context = {
        ui: mockUi,
        config: {
          'ssh-tunnel': {
            host: 'example.com',
            username: 'ghedamat',
            srcPort: 50000,
            dstPort: 6379,
            tunnelClient: function() {
              return function(config, cbk) {
                process.nextTick(cbk, false, true);
                return {
                  close: function() { }
                };
              };
            }
          }
        },
      };
      plugin.beforeHook(context);
    });

    it('returns the updated context if tunnel is successful', function(done) {
      assert.isFulfilled(plugin.setup(context)).then(function(result) {
        assert.isDefined(result.tunnel.handler);
        assert.isDefined(result.tunnel.srcPort);
        done();
      }).catch(function(reason) {
        done(reason.actual.stack);
      });
    });
  });

  describe('teardown hook', function() {
    var plugin;
    var context;

    beforeEach(function() {
      plugin = subject.createDeployPlugin({
        name: 'ssh-tunnel'
      });

      context = {
        ui: mockUi,
        config: {
          'ssh-tunnel': {
          }
        }
      };
      plugin.beforeHook(context);
    });

    it('closes the tunnel', function(done) {
      context.tunnel = {
        handler: {
          close: function() {
            assert.ok(true);
            done();
          }
        }
      };

      var result = plugin.teardown(context);
    });
  });
});
