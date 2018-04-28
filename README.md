# noicejs

extremely thin dependency injection (v2: now with async!)

[![npm package](https://img.shields.io/npm/v/noicejs.svg)](https://www.npmjs.com/package/noicejs)
[![pipeline status](https://git.apextoaster.com/apex-open/noicejs/badges/master/pipeline.svg)](https://git.apextoaster.com/apex-open/noicejs/commits/master)
[![Dependency Status](https://david-dm.org/ssube/noicejs.svg)](https://david-dm.org/ssube/noicejs)
[![devDependency Status](https://david-dm.org/ssube/noicejs/dev-status.svg)](https://david-dm.org/ssube/noicejs#info=devDependencies)
[![Code Climate](https://codeclimate.com/github/ssube/noicejs/badges/gpa.svg)](https://codeclimate.com/github/ssube/noicejs)

Inspired by [Google's Guice library](https://github.com/google/guice) and written in
[Typescript](https://www.typescriptlang.org/).

## Usage

Consider a `User` class that needs to fetch data from the `Server`, but doesn't know (or need to know) where that
server is or what it runs on.

```typescript
import {Container, Inject, Module} from 'noicejs';
import {Server} from './abstract/Server';
import {NetworkServer} from './network/Server';

/**
 * Decorate your class with any dependencies it
 * needs to be created with.
 */
@Inject(Server)
class User {
  constructor({server, id}) {
    this.data = server.getUserData(id);
  }
}

/**
 * Declare a Module to link your interface and
 * the implementation.
 */
class NetworkModule extends Module {
  configure() {
    this.bind(Server).toConstructor(NetworkServer);
  }
}

/**
 * Create an Injector and use it to create a User.
 */
const ctr = Container.from(new NetworkModule());
const user = await ctr.create(User, {
  id: 3
});
```

noicejs will check the decorated constructor, find the correct provider for each dependency, and collect them before
calling the constructor or factory.

Any extra parameters you pass to `create` will be passed on to the constructor.

## Build

To build a bundle and run tests:

```shell
yarn
make
```
