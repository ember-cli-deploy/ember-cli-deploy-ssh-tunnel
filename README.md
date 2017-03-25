# Ember-cli-deploy-ssh-tunnel

> An ember-cli-deploy plugin to open an ssh tunnel during your deploy

[![Circle CI](https://circleci.com/gh/ghedamat/ember-cli-deploy-ssh-tunnel/tree/master.svg?style=shield)](https://circleci.com/gh/ghedamat/ember-cli-deploy-ssh-tunnel/tree/master)

[![](https://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/plugins/ember-cli-deploy-ssh-tunnel.svg)](http://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/)

This plugins opens an ssh tunnel forwarding a port to the host you specify to one of your local ports.

A typical use case is to pair this plugin with the [ember-cli-deploy-redis](https://github.com/zapnito/ember-cli-deploy-redis) plugin to reach to redis servers that for security reasons are not listening to their public IP.

## What is an ember-cli-deploy plugin?

A plugin is an addon that can be executed as a part of the ember-cli-deploy pipeline. A plugin will implement one or more of the ember-cli-deploy's pipeline hooks.

For more information on what plugins are and how they work, please refer to the [Plugin Documentation][1].

## Quick Start

To get up and running quickly, do the following:

- Install this plugin

```bash
$ ember install ember-cli-deploy-ssh-tunnel
```

- For typical usage with `ember-cli-deploy-redis`, place the following configuration into `config/deploy.js`.

```javascript
ENV['ssh-tunnel'] = {
  username: 'yourname',
  host: 'yourserver',

  // A unique port on your local machine to forward to on the remote
  // server.  This will be set to a random port between 49151 and 65535
  // by default.
  // srcPort: <49151 - 65535>,

  // The port that the remote redis server listens on. 6379 is the default value.
  // dstPort: 6379
};

ENV.redis.host = 'localhost':

// ember-cli-redis will connect to redis locally on `ENV['ssh-tunnel'].srcPort`.
// Transmissions on that port will be forwarded over SSH and be received on
// the remote machine on `ENV['ssh-tunnel'].dstPort`.
// With `ember-cli-deploy-redis >= 0.1.1` `ENV.redis.port` will default
// to `ENV['ssh-tunnel'].srcPort` if available. On lower versions
// you must explicitly set it to match `ENV['ssh-tunnel'].srcPort.
//
// ENV.redis.port = 49151;
```

- Run the pipeline

```bash
$ ember deploy
```

## Installation
Run the following command in your terminal:

```bash
ember install ember-cli-deploy-ssh-tunnel
```

## ember-cli-deploy Hooks Implemented

For detailed information on what plugin hooks are and how they work, please refer to the [Plugin Documentation][1].

- `configure`
- `willUpload`
- `didUpload`

## Configuration Options

For detailed information on how configuration of plugins works, please refer to the [Plugin Documentation][1].

### username (`required`)

The user for the ssh connection.

*Default:* `undefined`

### host (`required`)

The server to connect to.

*Default:* `undefined`

### dstPort

The port to forward from the server.

*Default:* `6379`

### dstHost

The host to forward to on the destination server.

*Default:* `localhost`

### srcPort

The local port for the forwarding.

*Default:* a random port between `49151` and `65535`

### port

The ssh port on the destination server.

*Default:* `22`

### privateKeyPath

The local path to your ssh private key.

*Default:* null

### password

Authorization string for the ssh connection.

*Default:* null

### tunnelClient

The client used to create the ssh tunnel. This allows the user the ability to use their own client for uploading instead of the one provided by this plugin.

*Default:* the tunnel provided by `tunnel-ssh`

## Authorization

ember-cli-deploy-ssh-tunnel uses the [tunnel-ssh](https://github.com/Finanzchef24-GmbH/tunnel-ssh) module to provide the SSH tunnel. Two options exist to configure tunnel-ssh from ember-cli-deploy-ssh-tunnel: `privateKeyPath` and `password`. By default, we assume you have created a public and private key and added it to ssh-agent as described in the [default GitHub setup](https://help.github.com/articles/generating-ssh-keys/).

If no authentication information is delivered to tunnel-ssh, it will [default to using ssh-agent](https://github.com/Finanzchef24-GmbH/tunnel-ssh), so it will default to using the default id_rsa keys generated as described in the GitHub article. This includes password-protected SSH keys. If you would like to use a different SSH key, set the `privateKeyPath` option:

```js
ENV['ssh-tunnel'] = {
  username: 'yourname',
  host: 'yourserver',
  privateKeyPath: '~/.ssh/another_key_rsa'
};
```

If you just want to use a password to tunnel, you can specify that as an option (we recommend using environmental variables in an .env file):

```js
ENV['ssh-tunnel'] = {
  username: 'yourname',
  host: 'yourserver',
  password: process.env.SSH_PASSWORD
};
```

NOTE: at this time, this plugin does not support setting a path to `privateKeyPath` to a key that has been encrypted with a password.

## Running Tests

* yarn test

## Why `ember build` and `ember test` don't work

Since this is a node-only ember-cli addon, this package does not include many files and dependencies which are part of ember-cli's typical `ember build` and `ember test` processes.

## Thanks to:

@lukemelia and @achambers and the other folks from the ember-cli-deploy project.

@tim-evans for the original implementation in [ember-deploy-redis](https://github.com/LevelbossMike/ember-deploy-redis)

[1]: http://ember-cli.github.io/ember-cli-deploy/plugins "Plugin Documentation"
