include $(shell find $(ROOT_PATH) -name '*.mk' | grep -v node_modules | sort)

# Tool options
.PHONY: all clean clean-deps clean-target configure docs help todo
.PHONY: build build-bundle build-docs build-image test test-check test-cover test-watch
.PHONY: yarn-install yarn-upgrade git-push git-stats license-check release release-dry upload-climate upload-codecov

# Build targets
build-bundle: node_modules
	$(NODE_BIN)/rollup --config $(CONFIG_PATH)/rollup/config.js
	sed -i '1s;^;#! /usr/bin/env node\n\n;' $(TARGET_PATH)/index.js

# release targets
license-check: ## check license status
	licensed cache
	licensed status

upload-climate:
	cc-test-reporter format-coverage -t lcov -o $(TARGET_PATH)/coverage/codeclimate.json -p $(ROOT_PATH) $(TARGET_PATH)/coverage/lcov.info
	cc-test-reporter upload-coverage --debug -i $(TARGET_PATH)/coverage/codeclimate.json -r "$(shell echo "${CODECLIMATE_SECRET}" | base64 -d)"

upload-codecov:
	codecov --disable=gcov --file=$(TARGET_PATH)/coverage/lcov.info --token=$(shell echo "${CODECOV_SECRET}" | base64 -d)
