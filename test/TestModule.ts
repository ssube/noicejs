import { expect } from 'chai';
import { match, spy } from 'sinon';

import { LoggerNotFoundError, NullLogger, Provides } from '../src';
import { BaseOptions, Container } from '../src/Container';
import { Module, ModuleOptions, ProviderType } from '../src/Module';
import { isNil } from '../src/utils';
import { describeAsync, itAsync } from './helpers/async';

/* tslint:disable:no-unbound-method */

describeAsync('injection modules', async () => {
  itAsync('should be extendable', async () => {
    class TestModule extends Module {
      public async configure(options: ModuleOptions) { /* noop */ }
    }

    const module = new TestModule();
    spy(module, 'configure');

    const container = Container.from(module);
    await container.configure();

    expect(module.configure).to.have.been.called.callCount(1);
    expect(module.configure).to.have.been.calledWithMatch(match.has('container', container));
  });

  itAsync('should report bindings', async () => {
    class TestModule extends Module {
      public async configure(options: ModuleOptions) {
        this.bind('a').toConstructor(TestModule);
        this.bind('b').toFactory(() => Promise.resolve(3));
        this.bind('c').toInstance(1);
      }
    }

    const module = new TestModule();
    const container = Container.from(module);
    await container.configure();

    expect(module.has('a'), 'has a constructor').to.equal(true);
    expect(module.has('b'), 'has a factory').to.equal(true);
    expect(module.has('c'), 'has an instance').to.equal(true);
    expect(module.has('d'), 'does not have').to.equal(false);
  });

  itAsync('should get the same instance each time', async () => {
    class TestModule extends Module {
      public async configure(options: ModuleOptions) {
        this.bind('c').toInstance({});
      }
    }

    const module = new TestModule();
    const container = Container.from(module);
    await container.configure();

    const check = await container.create('c');
    const again = await container.create('c');

    expect(check).to.equal(again);
  });

  itAsync('should convert contract names', async () => {
    class TestClass { /* noop */ }
    class TestModule extends Module {
      public async configure(options: ModuleOptions) {
        this.bind(TestClass).toConstructor(TestClass);
      }
    }

    const module = new TestModule();
    const container = Container.from(module);
    await container.configure();

    expect(module.has(TestClass.name), 'has a constructor').to.equal(false);
  });

  itAsync('should invoke complex factories', async () => {
    class TestInstance { }
    let instance: TestInstance;

    class TestModule extends Module {
      public async configure(options: ModuleOptions) {
        this.bind('a').toFactory(async (args) => this.getInstance(args));
      }

      public async getInstance(options: BaseOptions): Promise<TestInstance> {
        if (isNil(instance)) {
          instance = await options.container.create(TestInstance);
        }

        return instance;
      }
    }

    const module = new TestModule();
    spy(module, 'getInstance');

    const container = Container.from(module);
    await container.configure();

    const ref = await container.create('a');

    expect(module.has('a')).to.equal(true);
    expect(module.get('a').type).to.equal(ProviderType.Factory);

    expect(module.getInstance).to.have.been.called.callCount(1);
    expect(module.getInstance).to.have.been.calledWith({ container });

    expect(ref, 'return the same instance').to.equal(await container.create('a'));
  });

  itAsync('should invoke factories with the module scope', async () => {
    let scope: Module | undefined;
    class TestModule extends Module {
      public async configure(options: ModuleOptions) {
        this.bind('test').toFactory(this.testFactory);
      }

      public async testFactory() {
        scope = this;
        return {};
      }
    }

    const module = new TestModule();
    const container = Container.from(module);
    await container.configure();
    await container.create('test');

    expect(scope).to.equal(module);
  });

  itAsync('should print debug logs', async () => {
    class TestModule extends Module {
      public debug() { /* noop */ }
    }

    const logger = new NullLogger();
    spy(logger, 'debug');

    const module = new TestModule();
    spy(module, 'debug');

    const container = Container.from(module);
    await container.configure({
      logger,
    });
    container.debug();

    expect(logger.debug).to.have.callCount(2);
    expect(module.debug).to.have.callCount(1);
  });

  itAsync('should count provider methods', async () => {
    class TestModule extends Module {
      public async configure(options: BaseOptions) {
        await super.configure(options);

        this.bind('foo').toInstance({});
      }

      @Provides('bar')
      public async counted() {
        /* noop */
      }
    }

    const module = new TestModule();
    const container = Container.from(module);
    await container.configure();

    expect(module.size).to.equal(2);
  });

  itAsync('should throw if it has no logger', async () => {
    class TestModule extends Module { }

    const module = new TestModule();
    const container = Container.from(module);
    await container.configure();

    expect(() => {
      module.debug();
    }).to.throw(LoggerNotFoundError);
  });
});
