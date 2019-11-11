import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { spy } from 'sinon';

import { Container } from '../../src/Container';
import { ContainerBoundError } from '../../src/error/ContainerBoundError';
import { ContainerNotBoundError } from '../../src/error/ContainerNotBoundError';
import { LoggerNotFoundError } from '../../src/error/LoggerNotFoundError';
import { Logger } from '../../src/logger/Logger';
import { Module } from '../../src/Module';
import { Provides } from '../../src/Provides';
import { TestModule } from '../HelperClass';
import { describeLeaks, itLeaks } from '../helpers/async';
import { getTestLogger } from '../helpers/logger';

/* eslint-disable no-null/no-null, @typescript-eslint/unbound-method */

const TEST_MODULE_COUNT = 8; // the number of test modules to create

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

  itLeaks('should throw on debug without logger', async () => {
    const container = Container.from();
    expect(() => {
      container.debug();
    }).to.throw(LoggerNotFoundError);
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

});
