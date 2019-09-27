# Container

The container is the primary interface of noicejs. With the help of [modules](./module.md), the container provides
service discovery and dependency injection to object instantiated through it.

## Configure

The `configure` method will set up the container's internal state and recursively configure any modules within this
container. The container cannot be used to [`create`](#create) instances until it has been configured.

## Create

Instantiate the passed contract, with any dependencies listed in `@Inject`. This will asynchronously and recursively
resolve dependencies.
