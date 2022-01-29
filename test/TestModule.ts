import { expect } from 'chai';
import { match, spy } from 'sinon';

import { LoggerNotFoundError, Provides } from '../src/index.js';
import { BaseOptions, Container } from '../src/Container.js';
import { Module, ModuleOptions, ProviderType } from '../src/Module.js';
import { isNil } from '../src/utils/index.js';
import { getTestLogger } from './helpers/logger.js';

/* eslint-disable @typescript-eslint/unbound-method */

describe('module', async () => {
  it('should be extendable', async () => {
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

  it('should report bindings', async () => {
    const SOME_VAL = 3;
    class TestModule extends Module {
      public async configure(options: ModuleOptions) {
        this.bind('a').toConstructor(TestModule);
        this.bind('b').toFactory(() => Promise.resolve(SOME_VAL));
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

  it('should get the same instance each time', async () => {
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

  it('should convert contract names', async () => {
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

  it('should invoke complex factories', async () => {
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

  it('should invoke factories with the module scope', async () => {
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

  it('should print debug logs', async () => {
    class TestModule extends Module {
      public debug() { /* noop */ }
    }

    const logger = getTestLogger();
    spy(logger, 'debug');

    const module = new TestModule();
    spy(module, 'debug');

    const container = Container.from(module);
    await container.configure({
      logger,
    });
    container.debug();

    const EXPECTED_LOGS = 2;
    expect(logger.debug).to.have.callCount(EXPECTED_LOGS);
    expect(module.debug).to.have.callCount(1);
  });

  it('should count provider methods', async () => {
    class TestModule extends Module {
      public async configure(options: BaseOptions) {
        await super.configure(options);

        this.bind('foo').toInstance({});
      }

      /* c8 ignore next 4 */
      @Provides('bar')
      public async counted() {
        /* noop */
      }
    }

    const module = new TestModule();
    const container = Container.from(module);
    await container.configure();

    const EXPECTED_LOGS = 2;
    expect(module.size).to.equal(EXPECTED_LOGS);
  });

  it('should throw if it has no logger', async () => {
    class TestModule extends Module { }

    const module = new TestModule();
    const container = Container.from(module);
    await container.configure();

    expect(() => {
      module.debug();
    }).to.throw(LoggerNotFoundError);
  });

  it('should skip method binding on modules without a prototype', async () => {
    const ctrSpy = spy();
    const logSpy = spy();
    /* eslint-disable-next-line no-null/no-null */
    const module = Object.create(null, {
      configure: {
        value: Module.prototype.configure,
      },
      container: {
        set: ctrSpy,
      },
      logger: {
        set: logSpy,
      },
    });

    await module.configure({
      container: Container.from(),
      logger: getTestLogger(),
    });

    expect(ctrSpy).to.have.callCount(1);
    expect(logSpy).to.have.callCount(1);
  });
});
