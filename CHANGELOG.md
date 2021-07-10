# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.0.0](https://github.com/ssube/noicejs/compare/v3.3.0...v4.0.0) (2021-07-10)


### ⚠ BREAKING CHANGES

* the 4.x release family will support Node 16+ and
drop support for previous versions.

### Features

* document supported Node versions ([aca25b4](https://github.com/ssube/noicejs/commit/aca25b44505623383e72bde3586ad14d353d734a))

## [3.3.0](https://github.com/ssube/noicejs/compare/v3.1.0...v3.3.0) (2021-07-10)


### Features

* only bind module prototype if it exists ([cf46c10](https://github.com/ssube/noicejs/commit/cf46c10728609f89f0e3c80ed8fbeea264fc72e6))
* **build:** update to node 12 ([6f61e80](https://github.com/ssube/noicejs/commit/6f61e80595ce42be27f14110da356566b1eca921))


### Bug Fixes

* **build:** add eslint peer dep ([04af63f](https://github.com/ssube/noicejs/commit/04af63f304313f1cec130f7327877c3a8177d299))
* **build:** pull images from nexus ([e1c12dd](https://github.com/ssube/noicejs/commit/e1c12ddd9109164fbcb5b210f937a8403c9a239e))
* **test:** cover modules without prototypes ([86281e2](https://github.com/ssube/noicejs/commit/86281e2a0c3d0ab187d4133ee6cc77315217972a))

## [3.2.0](https://github.com/ssube/noicejs/compare/v3.1.0...v3.2.0) (2021-07-10)


### Features

* only bind module prototype if it exists ([cf46c10](https://github.com/ssube/noicejs/commit/cf46c10728609f89f0e3c80ed8fbeea264fc72e6))
* **build:** update to node 12 ([6f61e80](https://github.com/ssube/noicejs/commit/6f61e80595ce42be27f14110da356566b1eca921))


### Bug Fixes

* **build:** add eslint peer dep ([04af63f](https://github.com/ssube/noicejs/commit/04af63f304313f1cec130f7327877c3a8177d299))
* **build:** pull images from nexus ([e1c12dd](https://github.com/ssube/noicejs/commit/e1c12ddd9109164fbcb5b210f937a8403c9a239e))
* **test:** cover modules without prototypes ([86281e2](https://github.com/ssube/noicejs/commit/86281e2a0c3d0ab187d4133ee6cc77315217972a))

## [3.1.0](https://github.com/ssube/noicejs/compare/v3.0.1...v3.1.0) (2020-09-06)


### Features

* **test:** add readme example as test ([6eb9816](https://github.com/ssube/noicejs/commit/6eb9816e0644a06eb7a6182dc5d3fd41b36365f3))


### Bug Fixes

* **build:** disable warnings for shadowing of private global types ([a9691ac](https://github.com/ssube/noicejs/commit/a9691ac8c82dc2917a7b04f2cd7439ce577c5750))
* **build:** extern source map modules to fix requires ([9d1cad0](https://github.com/ssube/noicejs/commit/9d1cad0202ce11aba749095b93c2ade34df513cf))
* **build:** update eslint for typescript-eslint 4 rules ([b779072](https://github.com/ssube/noicejs/commit/b77907253330fb121b13ae4c06c152833f3f4889))
* **config:** update lint to naming-convention rule ([2771a29](https://github.com/ssube/noicejs/commit/2771a293f59aba51a351e2354129efd9d4493966))
* **docs:** update readme with link to example test ([54170e3](https://github.com/ssube/noicejs/commit/54170e3ca2816a797f33f1332180d64c4b16b7e0))

### [3.0.1](https://github.com/ssube/noicejs/compare/v3.0.0...v3.0.1) (2020-03-07)


### Bug Fixes

* **lint:** replace some nulls with maybe type ([da28e08](https://github.com/ssube/noicejs/commit/da28e08be5c4ff854e283226c0746ddab8887051))

## [3.0.0](https://github.com/ssube/noicejs/compare/v3.0.0-8...v3.0.0) (2019-11-11)


### ⚠ BREAKING CHANGES

* **module:** this prevents the fluent bind().toConstructor() from
inferring options if the constructor or factory requires a subclass
of BaseOptions, since the options are resolved against the arguments
to bind. Previously, AnyOptions would have been accepted, regardless
of what the constructor or factory expects.

### Bug Fixes

* **build:** handle unplaced chunks ([dca135c](https://github.com/ssube/noicejs/commit/dca135c))
* **build:** update package keywords ([e7724f2](https://github.com/ssube/noicejs/commit/e7724f2))
* **docs:** update pages index example ([814ac8c](https://github.com/ssube/noicejs/commit/814ac8c))
* **docs:** update readme example ([bdc8457](https://github.com/ssube/noicejs/commit/bdc8457))
* **error:** indent every line of base stack ([1aadd0c](https://github.com/ssube/noicejs/commit/1aadd0c))
* **module:** add binding options type arg ([5adcb8f](https://github.com/ssube/noicejs/commit/5adcb8f))
* **module:** type options in implementation ([717a856](https://github.com/ssube/noicejs/commit/717a856))


### Features

* **build:** add sonar job ([a2232f6](https://github.com/ssube/noicejs/commit/a2232f6))

## [3.0.0-8](https://github.com/ssube/noicejs/compare/v3.0.0-7...v3.0.0-8) (2019-11-10)


### Bug Fixes

* **docs:** name links ([bb88f09](https://github.com/ssube/noicejs/commit/bb88f09))
* **docs:** replace readme symlink with file ([14cd6c9](https://github.com/ssube/noicejs/commit/14cd6c9))


### Features

* **build:** add alpine image from template ([755ee73](https://github.com/ssube/noicejs/commit/755ee73))
* **build:** replace tslint with eslint ([ec60786](https://github.com/ssube/noicejs/commit/ec60786))

## [3.0.0-7](https://github.com/ssube/noicejs/compare/v3.0.0-6...v3.0.0-7) (2019-10-04)


### ⚠ BREAKING CHANGES

* **logger:** properties of `LogLevel` in object literals will need to
be updated from strings (`'info'`) to enum references
(`LogLevel.Info`). This does not impact other usages.

### Bug Fixes

* **build:** remove readme link ([b6ebcc4](https://github.com/ssube/noicejs/commit/b6ebcc4))
* **build:** update lockfile with mirror packages ([dbfc411](https://github.com/ssube/noicejs/commit/dbfc411))
* **build:** update with additional makefile ([a380aed](https://github.com/ssube/noicejs/commit/a380aed))
* **container:** switch extra parameters back to any (fixes [#113](https://github.com/ssube/noicejs/issues/113)) ([8aee04e](https://github.com/ssube/noicejs/commit/8aee04e))
* **docs:** clean up preface module example ([ad33250](https://github.com/ssube/noicejs/commit/ad33250))
* **docs:** inject symbol ([94f8881](https://github.com/ssube/noicejs/commit/94f8881))
* **docs:** matching lists ([bbf0b48](https://github.com/ssube/noicejs/commit/bbf0b48))
* **docs:** note map module, add ToC ([20b530a](https://github.com/ssube/noicejs/commit/20b530a))
* **docs:** rewrite preface without ternary ([8a11ed2](https://github.com/ssube/noicejs/commit/8a11ed2))
* **docs:** use readme as docs root, link back ([3105f68](https://github.com/ssube/noicejs/commit/3105f68))
* **logger:** make log level an enum (fixes [#108](https://github.com/ssube/noicejs/issues/108)) ([b30ee41](https://github.com/ssube/noicejs/commit/b30ee41))
* return wrapped options for constructors ([68094d7](https://github.com/ssube/noicejs/commit/68094d7))
* take extra args as readonly arrays ([2ae2e0f](https://github.com/ssube/noicejs/commit/2ae2e0f))


### Features

* **build:** enable coverage thresholds ([8700216](https://github.com/ssube/noicejs/commit/8700216))
* **build:** migrate to rollup template config ([804e20e](https://github.com/ssube/noicejs/commit/804e20e))
* **build:** rollup json/yaml (update from rollup-template) ([89ffd03](https://github.com/ssube/noicejs/commit/89ffd03))
* **docs:** add GH pages config ([cc4f23d](https://github.com/ssube/noicejs/commit/cc4f23d))
* **logger:** add winston log adapter ([#120](https://github.com/ssube/noicejs/issues/120)) ([78877d5](https://github.com/ssube/noicejs/commit/78877d5))

## [3.0.0-6](https://github.com/ssube/noicejs/compare/v3.0.0-5...v3.0.0-6) (2019-09-27)


### Bug Fixes

* **build:** disable line lengths in markdownlint ([38b89df](https://github.com/ssube/noicejs/commit/38b89df))
* **docs:** add preface to getting started ([e71f445](https://github.com/ssube/noicejs/commit/e71f445))
* **docs:** declare classes at module scope ([1565076](https://github.com/ssube/noicejs/commit/1565076))
* **docs:** use map module in getting started ([5d041e5](https://github.com/ssube/noicejs/commit/5d041e5))
* **tests:** improve coverage ([9752051](https://github.com/ssube/noicejs/commit/9752051))


### Features

* add map module for simpler setup (fixes [#102](https://github.com/ssube/noicejs/issues/102)) ([e6e63c5](https://github.com/ssube/noicejs/commit/e6e63c5))
* **docs:** add basic getting started ([8906c4d](https://github.com/ssube/noicejs/commit/8906c4d))
* **docs:** begin adding examples ([395039d](https://github.com/ssube/noicejs/commit/395039d))
* **docs:** explain provider types and decorator ([f7c272c](https://github.com/ssube/noicejs/commit/f7c272c))

## [3.0.0-5](https://github.com/ssube/noicejs/compare/v3.0.0-4...v3.0.0-5) (2019-09-27)


### Bug Fixes

* **build:** switch to custom docker images with build tools ([0b163d8](https://github.com/ssube/noicejs/commit/0b163d8))
* **build:** use template typedef in package ([7a2b355](https://github.com/ssube/noicejs/commit/7a2b355))


### Features

* **build:** adopt rollup-template ([3976d82](https://github.com/ssube/noicejs/commit/3976d82))

## [3.0.0-4](https://github.com/ssube/noicejs/compare/v3.0.0-3...v3.0.0-4) (2019-09-15)


### Bug Fixes

* **options:** remove base type ([8633ad4](https://github.com/ssube/noicejs/commit/8633ad4))
* **test:** add test logger helper, improve test helper naming ([5064dd2](https://github.com/ssube/noicejs/commit/5064dd2))
* **tests:** merge old tests into new suites ([49360c8](https://github.com/ssube/noicejs/commit/49360c8))

## [3.0.0-3](https://github.com/ssube/noicejs/compare/v3.0.0-2...v3.0.0-3) (2019-09-15)


### Bug Fixes

* **build:** add tslint, fix errors ([c8eb91c](https://github.com/ssube/noicejs/commit/c8eb91c))
* **build:** bump coverage requirements ([31233de](https://github.com/ssube/noicejs/commit/31233de))
* **docs:** readme formatting ([f6da95e](https://github.com/ssube/noicejs/commit/f6da95e))
* **error:** remove redundant check for undefined stack traces ([10fdf66](https://github.com/ssube/noicejs/commit/10fdf66))
* **test:** improve debug coverage, error docs ([a616c71](https://github.com/ssube/noicejs/commit/a616c71))
* **tests:** test error cases better, clean up negated conditionals ([6108ab3](https://github.com/ssube/noicejs/commit/6108ab3))


### Features

* **decorator:** split constructor and function wrappers ([44f3531](https://github.com/ssube/noicejs/commit/44f3531))

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
