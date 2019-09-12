import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { spy } from 'sinon';

import { LoggerNotFoundError } from '../src';
import { BaseOptions, Container, Contract, withContainer } from '../src/Container';
import { BaseError } from '../src/error/BaseError';
import { ContainerBoundError } from '../src/error/ContainerBoundError';
import { ContainerNotBoundError } from '../src/error/ContainerNotBoundError';
import { InvalidProviderError } from '../src/error/InvalidProviderError';
import { MissingValueError } from '../src/error/MissingValueError';
import { Inject } from '../src/Inject';
import { Logger } from '../src/logger/Logger';
import { Module, ModuleOptions } from '../src/Module';
import { describeAsync, itAsync } from './helpers/async';

// @TODO: lint these tests properly :(
/* tslint:disable:no-any no-big-function no-null-keyword no-unbound-method */

const testModuleCount = 8; // the number of test modules to create

describeAsync('container', async () => {
  itAsync('should configure modules', async () => {
    class TestModule extends Module {
      public async configure() { /* noop */ }
    }

    const module = new TestModule();
    spy(module, 'configure');

    const container = Container.from(module);
    await container.configure();

    expect(module.configure).to.have.been.called.callCount(1);
  });

  itAsync('should be created from some modules', async () => {
    class TestModule extends Module {
      public async configure() { /* noop */ }
    }

    const modules = Array(testModuleCount).fill(null).map(() => new TestModule());
    const container = Container.from(...modules);

    expect(container.getModules()).to.deep.equal(modules);
  });

  itAsync('should be configured before being used', async () => {
    class TestModule extends Module {
      public async configure() { /* noop */ }
    }

    const modules = Array(testModuleCount).fill(null).map(() => new TestModule());
    const container = Container.from(...modules);

    return expect(container.create(TestModule)).to.eventually.be.rejectedWith(ContainerNotBoundError);
  });

  itAsync('should not be configured more than once', async () => {
    const container = Container.from();

    await container.configure();
    return expect(container.configure()).to.eventually.be.rejectedWith(ContainerBoundError);
  });

  itAsync('should be extended with some modules', async () => {
    class TestModule extends Module {
      public async configure() { /* noop */ }
    }

    const modules = Array(testModuleCount).fill(null).map(() => new TestModule());
    const container = Container.from(...modules);

    const extension = Array(testModuleCount).fill(null).map(() => new TestModule());
    const extended = container.with(...extension);

    const extendedModules = extended.getModules();
    expect(extendedModules.length).to.equal(testModuleCount * 2); // look ma, no magic numbers
    expect(extendedModules).to.include.members(modules);
    expect(extendedModules).to.include.members(extension);
  });

  itAsync('should handle a module returning bad providers', async () => {
    class TestModule extends Module {
      public async configure(options: ModuleOptions) {
        this.bind('d').toInstance({});
      }

      public get(contract: any): any {
        return {
          type: 'invalid',
          value: null,
        };
      }
    }

    const module = new TestModule();
    const container = Container.from(module);
    await container.configure();

    expect(container.create('d')).to.be.rejectedWith(InvalidProviderError);
  });

  itAsync('should throw when no contract was passed', async () => {
    const container = Container.from();
    await container.configure();

    expect(container.create(null as any)).to.be.rejectedWith(BaseError);
  });

  itAsync('should throw when the contract has no provider', async () => {
    class TestModule extends Module {
      public async configure(options: ModuleOptions) {
        this.bind('c').toInstance({});
      }
    }

    const module = new TestModule();
    const container = Container.from(module);
    await container.configure();

    expect(container.create('d')).to.be.rejectedWith(MissingValueError);
  });

  itAsync('should provide injected dependencies', async () => {
    const ctorSpy = spy();
    const instance = {};

    class FooClass { /* noop */ }

    @Inject(FooClass)
    class TestClass {
      constructor(...args: Array<any>) {
        ctorSpy(...args);
      }
    }

    class TestModule extends Module {
      public async configure(options: ModuleOptions) {
        this.bind(FooClass).toInstance(instance);
      }
    }

    const module = new TestModule();
    const container = Container.from(module);
    await container.configure();
    await container.create(TestClass);

    expect(ctorSpy).to.have.been.called.callCount(1);
    expect(ctorSpy).to.have.been.calledWithExactly({
      container,
      [FooClass.name]: instance,
    });
  });

  itAsync('should inject named dependencies', async () => {
    interface FooOptions extends BaseOptions {
      foo: FooClass;
    }
    class FooClass { /* noop */ }

    @Inject({contract: FooClass, name: 'foo'})
    class TestClass {
      public readonly foo: FooClass;

      constructor(options: FooOptions) {
        this.foo  = options.foo;
      }
    }

    class TestModule extends Module {
      public async configure(options: ModuleOptions) {
        this.bind(FooClass).toConstructor(FooClass);
      }
    }

    const module = new TestModule();
    const container = Container.from(module);
    await container.configure();

    const injected = await container.create(TestClass);
    expect(injected.foo).to.be.an.instanceof(FooClass);
  });

  itAsync('should not look up dependencies passed in options', async () => {
    @Inject('foo', 'bar')
    class TestClass {
      public foo: any;
      public bar: any;

      constructor(options: any) {
        this.foo = options.foo;
        this.bar = options.bar;
      }
    }

    const foo = {};
    class TestModule extends Module {
      public async configure(options: ModuleOptions) {
        this.bind('foo').toInstance(foo);
      }
    }

    const module = new TestModule();
    module.has = spy(module.has) as (contract: Contract<any, any>) => boolean;

    const container = Container.from(module);
    await container.configure();

    const bar = {};
    const injected = await container.create(TestClass, {
      bar,
    });

    expect(module.has).to.have.been.calledWith('foo');
    expect(module.has).not.to.have.been.calledWith('bar');
    expect(module.has, 'called for injected and foo').to.have.callCount(2);

    expect(injected.bar).to.equal(bar);
    expect(injected.foo).to.equal(foo);
  });

  itAsync('should log debug info', async () => {
    const container = Container.from();
    const debugSpy = spy();
    await container.configure({
      logger: ineeda<Logger>({
        debug: debugSpy,
      }),
    });
    container.debug();
    expect(debugSpy).to.have.callCount(1);
  });

  itAsync('should throw on debug without logger', async () => {
    const container = Container.from();
    expect(() => {
      container.debug();
    }).to.throw(LoggerNotFoundError);
  });

  itAsync('should throw when a module is missing a provider', async () => {
    const module = ineeda<Module>({
      get() {
        return null;
      },
    });
    const container = Container.from(module);

    return expect(container.provide(module, '', {}, [])).to.eventually.be.rejectedWith(MissingValueError);
  });
});

describeAsync('with container decorator', async () => {
  itAsync('should attach a container', async () => {
    const ctr = Container.from();
    await ctr.configure();

    @withContainer(ctr)
    class TestClass {
      public readonly container: Container;

      constructor(options: BaseOptions) {
        this.container = options.container;
      }
    }

    const instance = new TestClass({} as any);
    expect(instance.container).to.equal(ctr);
  });
});
