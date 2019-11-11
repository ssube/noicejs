# noicejs

Extremely thin, async dependency injection, now with
[a getting started guide](https://ssube.github.io/noicejs/getting-started).

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
- extensive test coverage

## Contents

- [noicejs](#noicejs)
  - [Features](#features)
  - [Contents](#contents)
  - [Status](#status)
  - [Releases](#releases)
  - [Usage](#usage)
  - [Build](#build)
  - [License](#license)

## Status

[![Pipeline status](https://img.shields.io/gitlab/pipeline/ssube/noicejs.svg?gitlab_url=https%3A%2F%2Fgit.apextoaster.com&logo=gitlab)](https://git.apextoaster.com/ssube/noicejs/commits/master)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=ssube_noicejs&metric=ncloc)](https://sonarcloud.io/dashboard?id=ssube_noicejs)
[![Test coverage](https://codecov.io/gh/ssube/noicejs/branch/master/graph/badge.svg)](https://codecov.io/gh/ssube/noicejs)
[![MIT license](https://img.shields.io/github/license/ssube/noicejs.svg)](https://github.com/ssube/noicejs/blob/master/LICENSE.md)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fssube%2Fnoicejs.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fssube%2Fnoicejs?ref=badge_shield)

[![Open bug count](https://img.shields.io/github/issues-raw/ssube/noicejs/type-bug.svg)](https://github.com/ssube/noicejs/issues?q=is%3Aopen+is%3Aissue+label%3Atype%2Fbug)
[![Open issue count](https://img.shields.io/github/issues-raw/ssube/noicejs.svg)](https://github.com/ssube/noicejs/issues?q=is%3Aopen+is%3Aissue)
[![Closed issue count](https://img.shields.io/github/issues-closed-raw/ssube/noicejs.svg)](https://github.com/ssube/noicejs/issues?q=is%3Aissue+is%3Aclosed)

[![Renovate badge](https://badges.renovateapi.com/github/ssube/noicejs)](https://renovatebot.com)
[![Dependency status](https://img.shields.io/david/ssube/noicejs.svg)](https://david-dm.org/ssube/noicejs)
[![Dev dependency status](https://img.shields.io/david/dev/ssube/noicejs.svg)](https://david-dm.org/ssube/noicejs?type=dev)
[![Known vulnerabilities](https://snyk.io/test/github/ssube/noicejs/badge.svg)](https://snyk.io/test/github/ssube/noicejs)

[![Maintainability score](https://api.codeclimate.com/v1/badges/5d4326d6f68a2fa137cd/maintainability)](https://codeclimate.com/github/ssube/noicejs/maintainability)
[![Technical debt ratio](https://img.shields.io/codeclimate/tech-debt/ssube/noicejs.svg)](https://codeclimate.com/github/ssube/noicejs/trends/technical_debt)
[![Quality issues](https://img.shields.io/codeclimate/issues/ssube/noicejs.svg)](https://codeclimate.com/github/ssube/noicejs/issues)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/ssube/noicejs.svg?logo=lgtm)](https://lgtm.com/projects/g/ssube/noicejs/context:javascript)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/ssube/noicejs.svg)](https://lgtm.com/projects/g/ssube/noicejs/alerts/)

## Releases

[![github release link](https://img.shields.io/badge/github-release-blue?logo=github)](https://github.com/ssube/noicejs/releases)
[![github release version](https://img.shields.io/github/tag/ssube/noicejs.svg)](https://github.com/ssube/noicejs/releases)
[![github commits since release](https://img.shields.io/github/commits-since/ssube/noicejs/v2.5.2.svg)](https://github.com/ssube/noicejs/compare/v2.5.2...master)

[![npm package link](https://img.shields.io/badge/npm-package-blue?logo=npm)](https://www.npmjs.com/package/noicejs)
[![npm release version](https://img.shields.io/npm/v/noicejs.svg)](https://www.npmjs.com/package/noicejs)
[![Typescript definitions](https://img.shields.io/npm/types/noicejs.svg)](https://www.npmjs.com/package/noicejs)

## Usage

Consider a `Server` class that needs to fetch data from the `Cache` and `Filesystem`, but doesn't know (or need to
know) how those are implemented.

```typescript
import { Cache, Filesystem } from './interfaces';
import { LocalModule } from './local';
import { NetworkModule } from './network';

@Inject(Cache, Filesystem)
class Server {
  protected readonly cache: Cache;
  protected readonly filesystem: Filesystem;
  protected readonly ttl: number;

  constructor(options) {
    this.cache = options.cache;
    this.filesystem = options.filesystem;
    this.ttl = defaultTo(options.ttl, 0);
  }

  get(path: string) {
    return options.cache.get(path, this.ttl, () => options.filesystem.get(path));
  }
}

function module() {
  if (process.env['DEBUG'] === 'TRUE') {
    return new LocalModule();
  } else {
    return new NetworkModule();
  }
}

async function main() {
  const container = Container.from(module());
  await container.configure();

  const foo = await container.create(Server, {
    /* cache and filesystem are found and injected by container */
    ttl: 60,
  });
}
```

noicejs will collect dependencies from the decorated constructor and any superclasses, find a provider for each
injected dependency, and asynchronously resolve them before calling the constructor. Any extra parameters are passed
on to the original constructor, along with the container and resolved dependencies.

## Build

To build a bundle and run tests:

```shell
> make

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

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fssube%2Fnoicejs.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fssube%2Fnoicejs?ref=badge_large)
