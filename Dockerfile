# use stretch for perf, alpine has a 10-15% hit
FROM node:12-stretch

# set up packages
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock

WORKDIR /app
RUN yarn install --production

# set up app
COPY . /app

# link app
RUN yarn global add file:$(pwd)
ENV PATH="${PATH}:$(yarn global bin)"

# run app
ENTRYPOINT [ "echo", "This image includes the noicejs dependency injection library, but is otherwise a noop. Please inherit FROM it and add your application." ]