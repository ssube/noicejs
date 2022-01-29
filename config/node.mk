# node options
NODE_BIN := $(ROOT_PATH)/node_modules/.bin
NODE_CMD ?= $(shell env node)
NODE_DEBUG ?= --inspect-brk=$(DEBUG_BIND):$(DEBUG_PORT) --nolazy
NODE_INFO := $(shell node -v)

# directory targets
node_modules: deps

out: build

# phony targets
build: ## build the app
build: node_modules
	yarn tsc

clean-deps: ## clean up the node_modules directory
	rm -rf node_modules/

NYC_ARGS := --all \
	--check-coverage \
	--exclude ".eslintrc.js" \
	--exclude "bundle/**" \
	--exclude "config/**" \
	--exclude "docs/**" \
	--exclude "out/bundle/**" \
	--exclude "out/coverage/**" \
	--exclude "test/**" \
	--reporter=text-summary \
	--reporter=lcov \
	--report-dir=out/coverage

cover: ## run tests with coverage
cover: node_modules out
	yarn nyc $(NYC_ARGS) yarn mocha $(MOCHA_ARGS) "out/**/Test*.js"

deps:
	yarn

docs:
	yarn api-extractor run -c config/api-extractor.json
	yarn api-documenter markdown -i out/temp -o out/docs

lint: ## run eslint
lint: node_modules
	yarn eslint src/ --ext .ts,.tsx

MOCHA_ARGS := --async-only \
	--check-leaks \
	--forbid-only \
	--require source-map-support \
	--require out/test/setup.js \
	--recursive \
	--sort

test: ## run tests
test: node_modules out
	yarn mocha $(MOCHA_ARGS) "out/src/lib.js" "out/**/Test*.js"

test-watch:
	$(NODE_BIN)/nyc $(COVER_OPTS) $(NODE_BIN)/mocha $(MOCHA_OPTS) --watch $(TARGET_PATH)/test-bundle.js

yarn-global: ## install bundle as a global tool
	yarn global add file:$(ROOT_PATH)

yarn-update: ## check yarn for outdated packages
	yarn upgrade-interactive --latest
