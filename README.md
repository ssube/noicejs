# noicejs

Extremely thin dependency injection. (v2: now with async!)

Inspired by [Google's Guice library](https://github.com/google/guice) and written in
[Typescript](https://www.typescriptlang.org/).

## Features

- async dependency resolution
- constructor and property injection
- modular containers with inheritance
- named dependencies using strings or unique symbols
- typed errors
- typescript typedefs
- zero runtime dependencies, bundled or otherwise

## Contents

- [noicejs](#noicejs)
  - [Features](#features)
  - [Contents](#contents)
  - [Status](#status)
  - [Releases](#releases)
  - [Usage](#usage)
  - [Build](#build)

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
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fssube%2Fnoicejs.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fssube%2Fnoicejs?ref=badge_shield)

## Releases

[![Github release version](https://img.shields.io/github/tag/ssube/noicejs.svg)](https://github.com/ssube/noicejs/releases)
[![Commits since release](https://img.shields.io/github/commits-since/ssube/noicejs/v2.5.2.svg)](https://github.com/ssube/noicejs/compare/v2.5.2...master)

[![npm release version](https://img.shields.io/npm/v/noicejs.svg)](https://www.npmjs.com/package/noicejs)
[![Typescript definitions](https://img.shields.io/npm/types/noicejs.svg)](https://www.npmjs.com/package/noicejs)

## Usage

Consider a `User` class that needs to fetch data from the `Server`, but doesn't know (or need to know) how `Server` is
implemented, only that it meets the contract.

```typescript
import { Container, Inject, Module } from 'noicejs';
import { Server } from 'src/api/Server';
import { NetworkServer } from 'src/impl/Server';

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
  async configure() {
    this.bind(Server).toConstructor(NetworkServer);
  }
}

/**
 * Create an Injector and use it to create a User.
 */
const ctr = Container.from(new NetworkModule());
const user = await ctr.create(User, {
  id: 3
  // server will be populated by the DI container
});
```

noicejs will check the decorated constructor, find the correct provider for each dependency, and collect them before
calling the constructor or factory.

Any extra parameters you pass to `create` will be passed on to the constructor.

## Build

To build a bundle and run tests:

```shell
> make build

yarn
yarn install v1.17.3
[1/4] Resolving packages...
success Already up-to-date.
Done in 0.20s.
/home/ssube/code/ssube/noicejs//node_modules/.bin/rollup --config /home/ssube/code/ssube/noicejs//config/rollup.js

src/index.ts, test/harness.ts, test/**/Test*.ts → out/...
...
created out/ in 3.3s
/home/ssube/code/ssube/noicejs//node_modules/.bin/api-extractor run --config /home/ssube/code/ssube/noicejs//config/api-extractor.json --local -v

api-extractor 7.3.8  - https://api-extractor.com/
...

API Extractor completed successfully
Success!
```
