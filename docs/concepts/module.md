# Module

The module provides a set of related classes for the [container](./container.md) to inject
into constructors with dependencies.

## Configure

The `configure` method is called by the container during its own `configure` method, and
should `bind` most contracts provided by the module.

### Decorator

The `@Provides` decorator will be discovered by the `super.configure()` method and passed
to `bind` automatically.

## Providers

Modules support three kinds of providers:

### Constructor

Bind a class constructor to the contract. A new instance of this class will be created for each
consumer.

### Factory

Bind a factory function to the contract. The function will be called each time and the async
result used as the dependency.

### Instance

Bind a single instance to the contract. Not quite a singleton, but the closest thing within DI.
