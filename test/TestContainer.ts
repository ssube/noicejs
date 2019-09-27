import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { spy } from 'sinon';

import { LoggerNotFoundError, NullLogger, Provides } from '../src';
import { BaseOptions, constructWithContainer, Container, Contract, invokeWithContainer } from '../src/Container';
import { BaseError } from '../src/error/BaseError';
import { ContainerBoundError } from '../src/error/ContainerBoundError';
import { ContainerNotBoundError } from '../src/error/ContainerNotBoundError';
import { InvalidProviderError } from '../src/error/InvalidProviderError';
import { MissingValueError } from '../src/error/MissingValueError';
import { Inject } from '../src/Inject';
import { Logger } from '../src/logger/Logger';
import { Module, ModuleOptions } from '../src/Module';
import { isNil } from '../src/utils';
import { Consumer, Implementation, Interface, TestModule } from './HelperClass';
import { describeLeaks, itLeaks } from './helpers/async';
import { getTestLogger } from './helpers/logger';

// @TODO: lint these tests properly :(
/* tslint:disable:no-any no-big-function no-null-keyword no-unbound-method */

interface SubOptions extends BaseOptions {
  other: string;
}

const TEST_MODULE_COUNT = 8; // the number of test modules to create
const TEST_STRING = 'test';

describeLeaks('container', async () => {
  itLeaks('should take a list of modules', async () => {
    class SubModule extends Module {
      public async configure() {
        // noop
      }
    }

    const modules = [new SubModule(), new SubModule()];
    const ctr = Container.from(...modules);
    await ctr.configure();

    expect(ctr.getModules()).to.deep.equal(modules);
  });

  itLeaks('should configure modules', async () => {
    const module = new TestModule();
    spy(module, 'configure');

    const container = Container.from(module);
    await container.configure();

    expect(module.configure).to.have.been.called.callCount(1);
  });

  itLeaks('should be created from some modules', async () => {
    const modules = Array(TEST_MODULE_COUNT).fill(null).map(() => new TestModule());
    const container = Container.from(...modules);

    expect(container.getModules()).to.deep.equal(modules);
  });

  itLeaks('should be configured before being used', async () => {
    const modules = Array(TEST_MODULE_COUNT).fill(null).map(() => new TestModule());
    const container = Container.from(...modules);

    return expect(container.create(TestModule)).to.eventually.be.rejectedWith(ContainerNotBoundError);
  });

  itLeaks('should not be configured more than once', async () => {
    const container = Container.from();

    await container.configure();
    return expect(container.configure()).to.eventually.be.rejectedWith(ContainerBoundError);
  });

  itLeaks('should be extended with some modules', async () => {
    const modules = Array(TEST_MODULE_COUNT).fill(null).map(() => new TestModule());
    const container = Container.from(...modules);

    const extension = Array(TEST_MODULE_COUNT).fill(null).map(() => new TestModule());
    const extended = container.with(...extension);

    const extendedModules = extended.getModules();
    expect(extendedModules.length).to.equal(TEST_MODULE_COUNT * 2); // look ma, no magic numbers
    expect(extendedModules).to.include.members(modules);
    expect(extendedModules).to.include.members(extension);
  });

  itLeaks('should handle a module returning bad providers', async () => {
    class BadModule extends Module {
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

    const module = new BadModule();
    const container = Container.from(module);
    await container.configure();

    expect(container.create('d')).to.be.rejectedWith(InvalidProviderError);
  });

  itLeaks('should throw when no contract was passed', async () => {
    const container = Container.from();
    await container.configure();

    expect(container.create(null as any)).to.be.rejectedWith(BaseError);
  });

  itLeaks('should throw when the contract has no provider', async () => {
    const module = new TestModule();
    const container = Container.from(module);
    await container.configure();

    expect(container.create('d')).to.be.rejectedWith(MissingValueError);
  });

  itLeaks('should provide injected dependencies', async () => {
    const ctorSpy = spy();
    const instance = {};

    class FooClass { /* noop */ }

    @Inject(FooClass)
    class TestClass {
      constructor(...args: Array<any>) {
        ctorSpy(...args);
      }
    }

    class FooModule extends Module {
      public async configure(options: ModuleOptions) {
        this.bind(FooClass).toInstance(instance);
      }
    }

    const module = new FooModule();
    const container = Container.from(module);
    await container.configure();
    await container.create(TestClass);

    expect(ctorSpy).to.have.been.called.callCount(1);
    expect(ctorSpy).to.have.been.calledWithExactly({
      container,
      [FooClass.name]: instance,
    });
  });

  itLeaks('should inject named dependencies', async () => {
    interface FooOptions extends BaseOptions {
      foo: FooClass;
    }
    class FooClass { /* noop */ }

    @Inject({ contract: FooClass, name: 'foo' })
    class TestClass {
      public readonly foo: FooClass;

      constructor(options: FooOptions) {
        this.foo = options.foo;
      }
    }

    class FooModule extends Module {
      public async configure(options: ModuleOptions) {
        this.bind(FooClass).toConstructor(FooClass);
      }
    }

    const module = new FooModule();
    const container = Container.from(module);
    await container.configure();

    const injected = await container.create(TestClass);
    expect(injected.foo).to.be.an.instanceof(FooClass);
  });

  itLeaks('should pass arguments to the constructor', async () => {
    const ctr = Container.from(new TestModule());
    await ctr.configure();

    const args = ['a', 'b', 'c'];
    const impl = await ctr.create(Consumer, {}, ...args);
    expect(impl.args).to.deep.equal(args);
  });

  itLeaks('should call provider methods', async () => {
    const modSpy = spy();

    class SubModule extends Module {
      @Provides(Interface)
      public async create() {
        modSpy();

        if (isNil(this.container)) {
          throw new Error('missing container');
        } else {
          return this.container.create(Implementation);
        }
      }
    }

    const mod = new SubModule();
    const ctr = Container.from(mod);
    await ctr.configure();

    const impl = await ctr.create(Consumer);
    expect(modSpy).to.have.been.called.callCount(1);
    expect(impl.deps[Interface.name]).to.be.an.instanceof(Implementation);
  });

  itLeaks('should call provider methods with dependencies', async () => {
    class Outerface { /* empty */ }
    const outerInstance = new Outerface();

    const modSpy = spy();
    class SubModule extends Module {
      public async configure(options: ModuleOptions) {
        await super.configure(options);
        this.bind(Outerface).toInstance(outerInstance);
      }

      @Inject(Outerface)
      @Provides(Interface)
      public async create(outer: { outerface: Outerface }) {
        if (this.logger !== undefined) {
          this.logger.debug({ outer }, 'submodule create');
        }

        modSpy(outer);
        if (isNil(this.container)) {
          throw new Error('missing container');
        } else {
          return this.container.create(Implementation, outer as any);
        }

      }
    }

    const ctr = Container.from(new SubModule());
    await ctr.configure();

    const impl = await ctr.create(Consumer);

    expect(modSpy).to.have.been.called.callCount(1);
    expect(impl.deps[Interface.name]).to.be.an.instanceOf(Implementation);
    expect(impl.deps[Interface.name].deps[Outerface.name]).to.equal(outerInstance);
  });

  itLeaks('should call bound factories', async () => {
    let counter = 0;

    class SubModule extends Module {
      public async configure() {
        this.bind(Interface).toFactory(async (deps: any, ...args: Array<any>) => {
          counter += 1;
          return new Implementation(deps, ...args);
        });
      }
    }

    const ctr = Container.from(new SubModule());
    await ctr.configure();

    const impl = await ctr.create(Consumer);

    expect(impl.deps[Interface.name]).to.be.an.instanceof(Implementation);
    expect(counter).to.equal(1);
  });

  itLeaks('should return bound instances', async () => {
    const name = 'foobar';
    const inst = {};

    class SubModule extends Module {
      public async configure() {
        this.bind(name).toInstance(inst);
      }
    }

    const ctr = Container.from(new SubModule());
    await ctr.configure();

    @Inject(name)
    class NameConsumer {
      public deps: any;

      constructor(deps: any) {
        this.deps = deps;
      }
    }

    const impl = await ctr.create(NameConsumer);
    expect(impl.deps[name]).to.equal(inst);
  });

  itLeaks('should invoke constructors', async () => {
    class Other { }
    class SubModule extends Module {
      public async configure() {
        this.bind(Interface).toConstructor(Implementation);
      }
    }

    const ctr = Container.from(new SubModule());
    await ctr.configure();

    const impl = await ctr.create(Interface);
    expect(impl).to.be.an.instanceof(Implementation);

    const other = await ctr.create(Other);
    expect(other).to.be.an.instanceof(Other);
  });

  itLeaks('should invoke factories', async () => {
    class SubModule extends Module {
      public async createInterface(deps: any, ...args: Array<any>) {
        return new Implementation(deps, ...args);
      }

      public async configure() {
        this.bind(Interface).toFactory((deps: any, ...args: Array<any>) => this.createInterface(deps, ...args));
      }
    }

    const ctr = Container.from(new SubModule());
    await ctr.configure();

    const impl = await ctr.create(Interface);
    expect(impl).to.be.an.instanceof(Implementation);
  });

  itLeaks('should not look up dependencies passed in options', async () => {
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
    class FooModule extends Module {
      public async configure(options: ModuleOptions) {
        this.bind('foo').toInstance(foo);
      }
    }

    const module = new FooModule();
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

  itLeaks('should inject a dependency from a module', async () => {
    const ctr = Container.from(new TestModule());
    await ctr.configure();

    const impl = await ctr.create(Consumer);
    expect(impl.deps[Interface.name]).to.be.an.instanceof(Implementation);
  });

  itLeaks('should inject a dependency into a factory method', async () => {
    const ctr = Container.from(new TestModule());
    await ctr.configure();

    const impl = await ctr.create(Consumer, {}, 3);
    expect(impl.args).to.deep.equal([3]);
    expect(impl.deps[Interface.name]).to.be.an.instanceof(Implementation);
  });

  itLeaks('should log debug info', async () => {
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

  itLeaks('should throw on missing dependencies', async () => {
    // TestModule does not provide outerface
    const ctr = Container.from(new TestModule());
    await ctr.configure();

    @Inject('outerface')
    class FailingConsumer {
      private readonly di: any;

      constructor(di: any) {
        this.di = di;
      }
    }

    return expect(ctr.create(FailingConsumer)).to.eventually.be.rejectedWith(MissingValueError);
  });

  itLeaks('should throw on debug without logger', async () => {
    const container = Container.from();
    expect(() => {
      container.debug();
    }).to.throw(LoggerNotFoundError);
  });

  itLeaks('should throw when a module is missing a provider', async () => {
    const module = ineeda<Module>({
      get() {
        return null;
      },
    });
    const container = Container.from(module);

    return expect(container.provide(module, '', {}, [])).to.eventually.be.rejectedWith(MissingValueError);
  });

  itLeaks('should print debug logs', async () => {
    class FooModule extends Module {
      @Provides('foo')
      public async createFoo() {
        return {};
      }
    }

    const logger = getTestLogger();
    spy(logger, 'debug');

    const module = new FooModule();
    const container = Container.from(module);
    await container.configure({
      logger,
    });
    container.debug();
    await container.create('foo');

    expect(logger.debug).to.have.callCount(9);
  });

  itLeaks('should resolve dependencies by contract', async () => {
    const foo = {};
    const fooSymbol = Symbol('foo');
    class FooModule extends Module {
      @Provides(fooSymbol)
      public async createFoo() {
        return foo;
      }
    }

    const logger = getTestLogger();
    spy(logger, 'debug');

    const module = new FooModule();
    const container = Container.from(module);
    await container.configure({
      logger,
    });

    expect(await container.create(fooSymbol)).to.equal(foo);
  });

  itLeaks('should fail and throw with a logger', async () => {
    @Inject('foo')
    class Bar {}

    const container = Container.from();
    await container.configure({
      logger: NullLogger.global,
    });

    const module = ineeda<Module>({
      get(contract: Contract<unknown, BaseOptions>) {
        return undefined;
      }
    });

    return expect(container.provide(module, Bar, {}, [])).to.eventually.be.rejectedWith(MissingValueError);
  });
});

describeLeaks('container decorators', async () => {
  describeLeaks('construct with', async () => {
    itLeaks('should attach a container', async () => {
      const ctr = Container.from();
      await ctr.configure();

      @constructWithContainer(ctr)
      class TestClass {
        public readonly container: Container;

        constructor(options: BaseOptions) {
          this.container = options.container;
        }
      }

      const instance = new TestClass({} as any);
      expect(instance.container).to.equal(ctr);
    });

    itLeaks('should pass on any other options', async () => {
      const ctr = Container.from();
      await ctr.configure();

      @constructWithContainer(ctr)
      class TestClass {
        public readonly container: Container;
        public readonly other: string;

        constructor(options: SubOptions) {
          this.container = options.container;
          this.other = options.other;
        }
      }

      const instance = new TestClass({
        other: TEST_STRING,
      } as any);
      expect(instance.other).to.equal(TEST_STRING);
    });

    itLeaks('should pass on any other arguments', async () => {
      const ctr = Container.from();
      await ctr.configure();

      @constructWithContainer(ctr)
      class TestClass {
        public readonly container: Container;
        public readonly param1: any;
        public readonly param2: any;

        constructor(options: BaseOptions, param1: any, param2: any) {
          this.container = options.container;
          this.param1 = param1;
          this.param2 = param2;
        }
      }

      const arg1 = {};
      const arg2 = {};
      const instance = new TestClass({} as any, arg1, arg2);
      expect(instance.param1).to.equal(arg1);
      expect(instance.param2).to.equal(arg2);
    });
  });

  describeLeaks('invoke with', async () => {
    itLeaks('should attach a container', async () => {
      const ctr = Container.from();
      await ctr.configure();

      const fn = invokeWithContainer(ctr, (options: BaseOptions) => {
        return options.container;
      });

      expect(fn({})).to.equal(ctr);
    });

    itLeaks('should pass on any other options', async () => {
      const ctr = Container.from();
      await ctr.configure();

      const fn = invokeWithContainer(ctr, (options: SubOptions) => {
        return options.other;
      });

      expect(fn({
        other: TEST_STRING,
      })).to.equal(TEST_STRING);
    });

    itLeaks('should pass on any other arguments', async () => {
      const ctr = Container.from();
      await ctr.configure();

      const fn = invokeWithContainer(ctr, (options: Partial<BaseOptions>, param1: any, param2: any) => {
        return [param1, param2];
      });

      const arg1 = {};
      const arg2 = {};
      expect(fn({}, arg1, arg2)).to.deep.equal([arg1, arg2]);
    });
  });
});
