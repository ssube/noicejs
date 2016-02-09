## noice
### Extremely thin Dependency Injection
inspired by Google's Guice library and written with idiomatic JS.

While the examples use ES6 classes and ES7 decorators, you can
simply attach the same properties to your constructor function
and noice will happily inject your dependencies.

## Getting Started
Consider a `User` class that needs to fetch data from the server,
but may be running on the same node or making a network request.

First, decorate your class. You can attach any number of
dependencies, by super class, and noice will pass them into the
constructor:

    import {Inject, Injector, Module} from 'noice';
    import {Server} from './abstract/Server';
    import {NetworkServer} from './network/Server';

    @Inject(Server)
    class User {
      constructor(server, id) {
        this.data = server.getUserData(id);
      }
    }

Next, declare a `Module` to link your implementation to the
interface:

    class NetworkModule extends Module {
      configure() {
        this.bind(Server).to(NetworkServer);
      }
    }

Finally, create an `Injector` with your module and use
the injector to create a `User`:

    const injector = new Injector(new NetworkModule());
    const user = injector.create(User, 3);

noice will look at the decorated constructor, look up the
correct class (or instance) for each dependency, and instantiate
the class with the dependency. This is especially useful for
widely shared instances, like a connection pool or configuration.

Any additional parameters you pass to `create` will be passed on
to the constructor.

You can also call a decorated factory method using `execute` and
noice will inject dependencies in the same way:

    class User {
      @Inject(Server)
      static createUser(server, id) {
        return new User(server.getUserData(id));
      }
    }

    injector.execute(User.createUser, scope, 3);

## Providers
If your module is providing a more complex dependency, you
can declare a factory method and decorate it with the
interface:

    import {Module, Provides} from 'noice';

    class MyModule extends Module {
      configure() {
        // Bind other dependencies
      }

      @Provides(complexInterface)
      createComplex() {
        return ComplexImplementation.createOne('params');
      }
    }

Provider methods may require dependencies using the `@Inject`
decorator, allowing you to chain injection:

    import {Inject, Module, Provides} from 'noice';

    class NetworkModule extends Module {
      configure() {
        this.bind(Server).to(NetworkServer);
      }

      @Inject(Server)
      @Provides(Api)
      getApi(server) {
        return new ServerApi(server);
      }
    }

The dependencies for a provider can be in the same module or
any other module the `Injector` is aware of.

## Build
in the package manifest, so you can simply run:

    npm install && gulp

To build the library and run tests.
