image-run: ## run the development image
image-run:
	podman run -it \
		-e HOME=${HOME} \
		-e SSH_AUTH_SOCK=${SSH_AUTH_SOCK} \
		-v /run/user/$(shell id -u)/:/run/user/$(shell id -u)/:ro \
		-v $(shell dirname ${SSH_AUTH_SOCK}):$(shell dirname ${SSH_AUTH_SOCK}):rw \
		-v ${HOME}/.gnupg/:/.gnupg/:ro \
		-v $(ROOT_PATH):$(ROOT_PATH):rw \
		-w $(ROOT_PATH) \
		docker.artifacts.apextoaster.com/apextoaster/node:16.6 bash
#	-u $(shell id -u):$(shell id -g) \