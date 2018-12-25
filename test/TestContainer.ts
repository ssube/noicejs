import { expect } from 'chai';
import { match, spy } from 'sinon';

import { BaseError, MissingValueError } from 'src';
import { Container } from 'src/Container';
import { ContainerNotBoundError } from 'src/error/ContainerNotBoundError';
import { InvalidProviderError } from 'src/error/InvalidProviderError';
import { Inject } from 'src/Inject';
import { Module, ModuleOptions } from 'src/Module';

import { describeAsync, itAsync } from 'test/helpers/async';

const testModuleCount = 8; // the number of test modules to create

describeAsync('injection container', async () => {
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

    const injected = await container.create(TestClass);

    expect(ctorSpy).to.have.been.called.callCount(1);
    expect(ctorSpy).to.have.been.calledWithExactly({
      container,
      [FooClass.name]: instance,
    });
  });

  itAsync('should inject named dependencies', async () => {
    class FooClass { /* noop */ }

    @Inject({contract: FooClass, name: 'foo'})
    class TestClass {
      public readonly foo: FooClass;

      constructor(options: {foo: FooClass}) {
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
    module.has = spy(module.has);

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
});
