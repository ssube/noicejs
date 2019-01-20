# noicejs

Extremely thin dependency injection. (v2: now with async!)

Inspired by [Google's Guice library](https://github.com/google/guice) and written in
[Typescript](https://www.typescriptlang.org/).

## Status

[![Pipeline status](https://img.shields.io/gitlab/pipeline/ssube/noicejs.svg?gitlab_url=https%3A%2F%2Fgit.apextoaster.com&logo=gitlab)](https://git.apextoaster.com/ssube/noicejs/commits/master)
[![Test coverage](https://codecov.io/gh/ssube/noicejs/branch/master/graph/badge.svg)](https://codecov.io/gh/ssube/noicejs)
[![MIT license](https://img.shields.io/github/license/ssube/noicejs.svg)](https://github.com/ssube/noicejs/blob/master/LICENSE.md)

[![Open bug count](https://img.shields.io/github/issues-raw/ssube/noicejs/type-bug.svg)](https://github.com/ssube/noicejs/issues?q=is%3Aopen+is%3Aissue+label%3Atype%2Fbug)
[![Open issue count](https://img.shields.io/github/issues-raw/ssube/noicejs.svg)](https://github.com/ssube/noicejs/issues?q=is%3Aopen+is%3Aissue)
[![Closed issue count](https://img.shields.io/github/issues-closed-raw/ssube/noicejs.svg)](https://github.com/ssube/noicejs/issues?q=is%3Aissue+is%3Aclosed)

[![Greenkeeper badge](https://badges.greenkeeper.io/ssube/noicejs.svg)](https://greenkeeper.io/)
[![Maintainability score](https://api.codeclimate.com/v1/badges/5d4326d6f68a2fa137cd/maintainability)](https://codeclimate.com/github/ssube/noicejs/maintainability)
[![Technical debt ratio](https://img.shields.io/codeclimate/tech-debt/ssube/noicejs.svg)](https://codeclimate.com/github/ssube/noicejs/trends/technical_debt)
[![Quality issues](https://img.shields.io/codeclimate/issues/ssube/noicejs.svg)](https://codeclimate.com/github/ssube/noicejs/issues)

## Releases

[![Github release version](https://img.shields.io/github/tag/ssube/noicejs.svg)](https://github.com/ssube/noicejs/releases)
[![Commits since release](https://img.shields.io/github/commits-since/ssube/noicejs/v2.5.2.svg)](https://github.com/ssube/noicejs/compare/v2.5.2...master)

[![npm release version](https://img.shields.io/npm/v/noicejs.svg)](https://www.npmjs.com/package/noicejs)
[![Typescript definitions](https://img.shields.io/npm/types/noicejs.svg)](https://www.npmjs.com/package/noicejs)

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
