image: ## build the docker image
	docker build $(DOCKER_ARGS) -f Dockerfile -t $(DOCKER_IMAGE) .

build-image: ## build a docker image
	$(SCRIPT_PATH)/docker-build.sh --push
