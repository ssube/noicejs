## noicejs
### Extremely thin dependency injection

This is a DI library for JS, based on Google's Guice library.

While the examples use ES6 classes and ES7 decorators, you can
simply attach the right properties to your constructor function
and noicejs will happily inject your dependencies.

## Getting Started
To use noicejs with ES7 features, you should import the library
and decorate the class would be like dependencies provided to:

    import {Inject, Injector} from 'noice';

    @Inject(Foo, Bar)
    class FooBarUser {
      constructor(foo, bar) {
        this.fooStuff = foo.doStuff();
        this.barStuff = bar.doOtherStuff();
      }
    }

    injector.create(FooBarUser);

To create an object with dependencies, you must go through the
`Injector` class in noice. The `create` method takes a constructor
and optional parameters, finds any dependencies the class has, and
creates a new instance.

To create an injector, you should organize your dependencies into
modules and pass them in:

    import {Injector, Module} from 'noice';

    class MyModule extends Module {
      configure() {
        this.bind(myInterface).to(myImplementation);
      }
    }

    const injector = new Injector(new MyModule());

You only need to override the `configure` method in the module
and should avoid putting logic in the module if you can.

Modules providing more complicated dependencies can offer a factory
method for the dependency, using the `@Provides` decorator:

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
