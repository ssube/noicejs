# Getting Started

## Setup

Install noicejs with your package manager of choice:

```shell
> yarn add -D noicejs
```

If you will be bundling the output with a tool like Rollup or Webpack, you can install noicejs as a devDependency.

## Creating a Container

The container is the central interface of noicejs. Containers are responsible for creating new objects and resolving
dependencies from their modules.

Most containers are created from a list of modules, but they may also be created empty:

```typescript
import { Container } from 'noicejs';

async function main() {
  const container = Container.from();
  await container.configure();
}
```

While an empty container will not be have any dependencies to inject, it can still create new instances of
classes without dependencies:

```typescript
import { Container } from 'noicejs';

async function main() {
  const container = Container.from();
  await container.configure();

  class Foo { }
  const foo = await container.create(Foo);

  console.log(foo instanceof Foo);
  // prints: true
}
```

However, this container will not be able to create instances of a class that does have dependencies:

```typescript
import { Container } from 'noicejs';

async function main() {
  const container = Container.from();
  await container.configure();

  @Inject('foo')
  class Bar { }

  try {
    const bar = await container.create(Bar);
  } catch (err) {
    console.error(err);
    // prints: TODO
  }
}
```

## Creating a Module

In order to resolve a dependency, one of the modules within the container needs to provide it. Modules represent
a small set of dependencies with a common theme.

Modules bind most of their dependencies during configuration:

```typescript
import { Module, ModuleOptions } from 'noicejs';

class NetworkThing {}

class NetworkModule extends Module {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    this.bind('foo').toConstructor(NetworkThing);
  }
}
```

Modules must be instantiated before the container is created:

```typescript
import { Container } from 'noicejs';
import { NetworkModule, NetworkThing } from 'the-last-example';

async function main() {
  const container = Container.from(new NetworkModule());
  await container.configure();

  const foo = await container.create('foo');
  console.log(foo instanceOf NetworkThing);
}
```

Modules are not useful on their own and can be passed directly into the container's control.

## Requiring a Dependency

Now that a module exists to provide the contract `foo`, some other class needs to depend on
having an instance of `foo`:

```typescript
import { Container, Inject } from 'noicejs';
import { NetworkModule, NetworkThing } from 'the-module-example';

@Inject('foo')
class Bar {
  constructor(options) {
    console.log(options.container, options.foo);
  }
}

async function main() {
  const container = Container.from(new NetworkModule());
  await container.configure();

  const bar = await container.create(Bar);
  // prints: Container {}, NetworkThing {}
}
```

The decorator is optional and classes may be annotated manually instead, dependencies are a
constructor property using a particular `symbol`.
