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

- Place the following configuration into `config/deploy.js`

```javascript
ENV['ssh-tunnel'] = {
  username: 'yourname',
  host: 'yourserver',
};
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

The user for the ssh connection

*Default:* `undefined`

### host (`required`)

The server to connect to

*Default:* `undefined`

### dstPort

The port to forward from the server

*Default:* `6379`

### dstHost

The host to forward to on the destination server.

*Default:* `localhost`

### srcPort

The local port for the forwarding

*Default:* a random port between `49151` and `65535`

### privateKeyPath

The local path to your ssh private key

*Default:* `~/.ssh/id_rsa`

### tunnelClient

The client used to create the ssh tunnel. This allows the user the ability to use their own client for uploading instead of the one provided by this plugin.

*Default:* the tunnel provided by `tunnel-ssh`

## Running Tests

- `npm test`

[1]: http://ember-cli.github.io/ember-cli-deploy/plugins "Plugin Documentation"


## Thanks to:

@lukemelia and @achambers and the other folks from the ember-cli-deploy project.

@tim-evans for the original implementation in [ember-deploy-redis](https://github.com/LevelbossMike/ember-deploy-redis)
