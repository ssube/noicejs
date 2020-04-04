import { expect } from 'chai';
import { spy } from 'sinon';

import { LogLevel } from '../../src/logger/Logger';
import { WinstonLogger } from '../../src/logger/WinstonLogger';

const TEST_MSG = 'hello world';
const TEST_ARGS = ['foo', 'bar'];

describe('winston logger', async () => {
  it('should forward debug messages', async () => {
    const log = spy();
    const logger = new WinstonLogger({
      log,
    });

    const options = { foo: Math.random() };
    logger.debug(options, TEST_MSG, ...TEST_ARGS);
    expect(log).to.have.been.calledOnce.and.calledWithExactly(LogLevel.Debug, TEST_MSG, ...TEST_ARGS, options);
  });

  it('should forward error messages', async () => {
    const log = spy();
    const logger = new WinstonLogger({
      log,
    });

    const options = { foo: Math.random() };
    logger.error(options, TEST_MSG, ...TEST_ARGS);
    expect(log).to.have.been.calledOnce.and.calledWithExactly(LogLevel.Error, TEST_MSG, ...TEST_ARGS, options);
  });

  it('should forward info messages', async () => {
    const log = spy();
    const logger = new WinstonLogger({
      log,
    });

    const options = { foo: Math.random() };
    logger.info(options, TEST_MSG, ...TEST_ARGS);
    expect(log).to.have.been.calledOnce.and.calledWithExactly(LogLevel.Info, TEST_MSG, ...TEST_ARGS, options);
  });

  it('should forward warning messages', async () => {
    const log = spy();
    const logger = new WinstonLogger({
      log,
    });

    const options = { foo: Math.random() };
    logger.warn(options, TEST_MSG, ...TEST_ARGS);
    expect(log).to.have.been.calledOnce.and.calledWithExactly(LogLevel.Warn, TEST_MSG, ...TEST_ARGS, options);
  });

  it('should return itself as a child', async () => {
    const logger = new WinstonLogger({
      log: spy(),
    });

    expect(logger.child({})).to.equal(logger);
  });
});
