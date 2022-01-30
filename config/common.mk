# Git
export GIT_BRANCH ?= $(shell git rev-parse --abbrev-ref HEAD)
export GIT_COMMIT ?= $(shell git rev-parse HEAD)
export GIT_OPTIONS ?=
export GIT_REMOTES ?= $(shell git remote -v | awk '{ print $1; }' | sort | uniq)
export GIT_TAG ?= $(shell git tag -l --points-at HEAD | head -1)

# Paths
# resolve the makefile's path and directory, from https://stackoverflow.com/a/18137056
export MAKE_PATH    ?= $(abspath $(lastword $(MAKEFILE_LIST)))
export ROOT_PATH    ?= $(dir $(MAKE_PATH))
export CONFIG_PATH  ?= $(ROOT_PATH)/config
export DOCS_PATH    ?= $(ROOT_PATH)/docs
export SCRIPT_PATH  ?= $(ROOT_PATH)/scripts
export SOURCE_PATH  ?= $(ROOT_PATH)/src
export TARGET_PATH  ?= $(ROOT_PATH)/out
export TARGET_LOG   ?= $(TARGET_PATH)/make.log
export TARGET_MAIN  ?= $(TARGET_PATH)/index.js
export TEST_PATH    ?= $(ROOT_PATH)/test
export VENDOR_PATH  ?= $(ROOT_PATH)/vendor

# CI
export CI_COMMIT_REF_SLUG ?= $(GIT_BRANCH)
export CI_COMMIT_SHA ?= $(GIT_COMMIT)
export CI_COMMIT_TAG ?= $(GIT_TAG)
export CI_ENVIRONMENT_SLUG ?= local
export CI_JOB_ID ?= 0
export CI_PROJECT_PATH ?= $(shell ROOT_PATH=$(ROOT_PATH) ${SCRIPT_PATH}/ci-project-path.sh)
export CI_RUNNER_DESCRIPTION ?= $(shell hostname)
export CI_RUNNER_ID ?= $(shell hostname)
export CI_RUNNER_VERSION ?= 0.0.0

# Debug
export DEBUG_BIND ?= 127.0.0.1
export DEBUG_PORT ?= 9229

# Versions
export NODE_VERSION   := $(shell node -v || echo "none")
export RUNNER_VERSION := $(CI_RUNNER_VERSION)

all: lint build cover docs ## builds, bundles, and tests the application
	@echo Success!

ci: clean-target lint build cover docs

clean: ## clean up everything added by the default target
clean: clean-deps clean-target

clean-target: ## clean up the target directory
	rm -rf out/

configure: ## create the target directory and other files not in git
	mkdir -p $(TARGET_PATH)

# from https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help: ## print this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort \
		| sed 's/^.*\/\(.*\)/\1/' \
		| awk 'BEGIN {FS = ":[^:]*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

RELEASE_ARGS ?= --commit-all --sign

release: ## tag and push a release
release: node_modules
	if [[ "$(GIT_BRANCH)" != master ]]; \
	then \
		echo "Please merge to master before releasing."; \
		exit 1; \
	fi
	yarn standard-version $(RELEASE_ARGS)
	GIT_ARGS=--follow-tags $(MAKE) push

release-dry: ## test creating a release
	$(NODE_BIN)/standard-version --sign $(RELEASE_OPTS) --dry-run

todo:
	@echo "Remaining tasks:"
	@echo ""
	@grep -i "todo" -r docs/ src/ test/ || true
	@echo ""
	@echo "Pending tests:"
	@echo ""
	@grep "[[:space:]]xit" -r test/ || true
	@echo ""
	@echo "Casts to any:"
	@echo ""
	@grep "as any" -r src/ test/ || true
	@echo ""
	@echo "Uses of null:"
	@echo ""
	@grep -P -e "null(?!able)" -r src/ test/ || true
	@echo ""
	@echo "Uses of ==:"
	@echo ""
	@grep -e "[^=!]==[^=]" -r src/ test/ || true
	@echo ""
