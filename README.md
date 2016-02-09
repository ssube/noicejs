## noicejs
### Extremely thin dependency injection

This is a DI library for JS, based on Google's Guice library.

While the examples use ES6 classes and ES7 decorators, you can
simply attach the right properties to your constructor function
and noicejs will happily inject your dependencies.

## Getting Started
For noice to inject dependencies, you need to create objects
through an `Injector`. Each injector takes a list of modules,
which bind the dependency. The `create` method takes a constructor
and parameters, returning a new instance of the object.

### Injector
First, declare a `Module` and `Injector`:

    import {Injector, Module} from 'noice';

    class MyModule extends Module {
      configure() {
        this.bind(MyInterface).to(MyImplementation);
      }
    }

    const injector = new Injector(new MyModule());

This will register your dependencies and pass them into any
decorated constructors. You only need to override the
`configure` method on the `Module`.

### Create
Next, decorate your class and use the `Injector` to `create`
an instance:

    import {Inject} from 'noice';

    @Inject(MyInterface)
    class User {
      constructor(instance) {
        this.foo = instance.bar();
      }
    }

    injector.create(User);

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
