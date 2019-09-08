# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.0.0-2](https://github.com/ssube/noicejs/compare/v3.0.0-1...v3.0.0-2) (2019-09-08)


### Features

* export constructor type guard ([ce1cfe4](https://github.com/ssube/noicejs/commit/ce1cfe4))

## [3.0.0-1](https://github.com/ssube/noicejs/compare/v3.0.0-0...v3.0.0-1) (2019-09-08)


### Bug Fixes

* **build:** explicitly set publish registry, remove cache from package ([80d3b9a](https://github.com/ssube/noicejs/commit/80d3b9a))

## [3.0.0-0](https://github.com/ssube/noicejs/compare/v2.5.2...v3.0.0-0) (2019-09-08)


### ⚠ BREAKING CHANGES

* Contract requires two type parameters and option type
parameters extend BaseOptions, narrowing some types
* bundle library with rollup

### Bug Fixes

* **build:** ensure deps land in test bundle ([ae8b46e](https://github.com/ssube/noicejs/commit/ae8b46e))
* **build:** fix main bundle name ([bdaa17c](https://github.com/ssube/noicejs/commit/bdaa17c))
* **build:** remove external webpack modules from coverage ([45b8eb8](https://github.com/ssube/noicejs/commit/45b8eb8))
* **build:** use nexus mirror for yarn packages ([a6e3045](https://github.com/ssube/noicejs/commit/a6e3045))
* **test:** module mock type ([598bc70](https://github.com/ssube/noicejs/commit/598bc70))
* ensure option types extend base options, make arguments unknown ([7d6503e](https://github.com/ssube/noicejs/commit/7d6503e))
* **build:** move library source and entry to main ([2ed6a0d](https://github.com/ssube/noicejs/commit/2ed6a0d))
* **build:** update tests for rollup ([73d1d60](https://github.com/ssube/noicejs/commit/73d1d60))
* **docs:** fix license section ([ae4612f](https://github.com/ssube/noicejs/commit/ae4612f))
* **docs:** replace greenkeeper badge with renovate ([4a1309b](https://github.com/ssube/noicejs/commit/4a1309b))
* **docs:** update usage example ([e00318d](https://github.com/ssube/noicejs/commit/e00318d))
* **logger/console:** pass data parameters individually, test ([9d8bcd1](https://github.com/ssube/noicejs/commit/9d8bcd1))
* imports and typedef config ([d3a8cf8](https://github.com/ssube/noicejs/commit/d3a8cf8))


### Features

* **test:** cover all the easy stuff (errors and loggers) ([e6073d2](https://github.com/ssube/noicejs/commit/e6073d2))
* add withContainer decorator for components and other constructors ([9f05630](https://github.com/ssube/noicejs/commit/9f05630))
* **build:** add msft api-extractor and bundle typedefs ([f860b4c](https://github.com/ssube/noicejs/commit/f860b4c))
* **build:** upgrade to rollup from webpack ([e397489](https://github.com/ssube/noicejs/commit/e397489))
* **docs:** begin tagging exported symbols for API docs ([fedf58c](https://github.com/ssube/noicejs/commit/fedf58c))
* **docs:** build and add api docs ([ec93f71](https://github.com/ssube/noicejs/commit/ec93f71))
* **docs:** license section ([a116b00](https://github.com/ssube/noicejs/commit/a116b00))
* **test:** add source-map-support during tests ([7030dbc](https://github.com/ssube/noicejs/commit/7030dbc))
* **test:** inner error via cause ([af636c3](https://github.com/ssube/noicejs/commit/af636c3))
* **test:** rudimentary error coverage ([03f0264](https://github.com/ssube/noicejs/commit/03f0264))
* **test:** test stack traces ([1b24aa8](https://github.com/ssube/noicejs/commit/1b24aa8))
* upgrade from webpack to rollup ([49d3571](https://github.com/ssube/noicejs/commit/49d3571))

<a name="2.5.2"></a>
## [2.5.2](https://github.com/ssube/noicejs/compare/v2.5.1...v2.5.2) (2019-01-20)
