import { expect } from 'chai';
import { createStubInstance, spy } from 'sinon';

import { NullLogger } from '../../src/index.js';
import { Container } from '../../src/Container.js';
import { ContainerBoundError } from '../../src/error/ContainerBoundError.js';
import { ContainerNotBoundError } from '../../src/error/ContainerNotBoundError.js';
import { LoggerNotFoundError } from '../../src/error/LoggerNotFoundError.js';
import { Module } from '../../src/Module.js';
import { Provides } from '../../src/Provides.js';
import { TestModule } from '../HelperClass.js';
import { getTestLogger } from '../helpers/logger.js';

/* eslint-disable no-null/no-null, @typescript-eslint/unbound-method */

const TEST_MODULE_COUNT = 8; // the number of test modules to create
const TEST_MODULE_EXTENDED = 16;

describe('container', async () => {
  it('should take a list of modules', async () => {
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

  it('should configure modules', async () => {
    const module = new TestModule();
    spy(module, 'configure');

    const container = Container.from(module);
    await container.configure();

    expect(module.configure).to.have.been.called.callCount(1);
  });

  it('should be created from some modules', async () => {
    const modules = Array(TEST_MODULE_COUNT).fill(null).map(() => new TestModule());
    const container = Container.from(...modules);

    expect(container.getModules()).to.deep.equal(modules);
  });

  it('should be configured before being used', async () => {
    const modules = Array(TEST_MODULE_COUNT).fill(null).map(() => new TestModule());
    const container = Container.from(...modules);

    return expect(container.create(TestModule)).to.eventually.be.rejectedWith(ContainerNotBoundError);
  });

  it('should not be configured more than once', async () => {
    const container = Container.from();

    await container.configure();
    return expect(container.configure()).to.eventually.be.rejectedWith(ContainerBoundError);
  });
  it('should be extended with some modules', async () => {
    const modules = Array(TEST_MODULE_COUNT).fill(null).map(() => new TestModule());
    const container = Container.from(...modules);

    const extension = Array(TEST_MODULE_COUNT).fill(null).map(() => new TestModule());
    const extended = container.with(...extension);

    const extendedModules = extended.getModules();
    expect(extendedModules.length).to.equal(TEST_MODULE_EXTENDED);
    expect(extendedModules).to.include.members(modules);
    expect(extendedModules).to.include.members(extension);
  });

  it('should log debug info', async () => {
    const container = Container.from();
    const logger = createStubInstance(NullLogger);
    await container.configure({
      logger,
    });
    container.debug();
    expect(logger.debug).to.have.callCount(1);
  });

  it('should throw on debug without logger', async () => {
    const container = Container.from();
    expect(() => {
      container.debug();
    }).to.throw(LoggerNotFoundError);
  });

  it('should print debug logs', async () => {
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

    const LOG_COUNT = 9;
    expect(logger.debug).to.have.callCount(LOG_COUNT);
  });
});
