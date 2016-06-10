## noice
### Extremely Thin Dependency Injection
inspired by Google's Guice library and written with idiomatic JS.

[![Build Status](https://travis-ci.org/ssube/noicejs.svg?branch=master)](https://travis-ci.org/ssube/noicejs)
[![Dependency Status](https://david-dm.org/ssube/noicejs.svg)](https://david-dm.org/ssube/noicejs)
[![devDependency Status](https://david-dm.org/ssube/noicejs/dev-status.svg)](https://david-dm.org/ssube/noicejs#info=devDependencies)
[![Code Climate](https://codeclimate.com/github/ssube/noicejs/badges/gpa.svg)](https://codeclimate.com/github/ssube/noicejs)

While the examples use ES6 classes and ES7 decorators, you can
simply attach the same properties to your constructor function
and noice will happily inject your dependencies.

## Getting Started
Consider a `User` class that needs to fetch data from the server,
but may be running on the same node or making a network request.

    import {Inject, Injector, Module} from 'noice';
    import {Server} from './abstract/Server';
    import {NetworkServer} from './network/Server';

    /**
     * Decorate your class with any dependencies it
     * needs to be created with.
     */
    @Inject(Server)
    class User {
      constructor(server, id) {
        this.data = server.getUserData(id);
      }
    }

    /**
     * Declare a Module to link your interface and
     * the implementation.
     */
    class NetworkModule extends Module {
      configure() {
        this.bind(Server).to(NetworkServer);
      }
    }

    /**
     * Create an Injector and use it to create a User.
     */
    const injector = new Injector(new NetworkModule());
    const user = injector.create(User, 3);

noice will check the decorated constructor, find the correct
class for each dependency, and pass them into the constructor.

Any extra parameters you pass to `create` will be passed on
to the constructor.

You can also decorate a factory method and use `execute` to
inject dependencies:

    class User {
      @Inject(Server)
      static createUser(server, id) {
        return new User(server.getUserData(id));
      }
    }

    injector.execute(User.createUser, scope, 3);

## Build
in the package manifest, so you can simply run:

    npm install && gulp

To build the library and run tests.
