import { expect } from 'chai';
import { createStubInstance, spy } from 'sinon';

import { NullLogger } from '../../src/index.js';
import { LogLevel, logWithLevel } from '../../src/logger/Logger.js';

/* eslint-disable @typescript-eslint/unbound-method */

describe('log level switch', async () => {
  it('should log at debug level', async () => {
    const logger = createStubInstance(NullLogger);

    const data = {};
    const msg = 'test';
    logWithLevel(logger, LogLevel.Debug, data, msg);
    expect(logger.debug).to.have.been.called.callCount(1);
    expect(logger.debug).to.have.been.calledWithExactly(data, msg);
  });

  it('should log at error level', async () => {
    const logger = createStubInstance(NullLogger);

    const data = {};
    const msg = 'test';
    logWithLevel(logger, LogLevel.Error, data, msg);
    expect(logger.error).to.have.been.called.callCount(1);
    expect(logger.error).to.have.been.calledWithExactly(data, msg);
  });

  it('should log at info level', async () => {
    const logger = createStubInstance(NullLogger);

    const data = {};
    const msg = 'test';
    logWithLevel(logger, LogLevel.Info, data, msg);
    expect(logger.info).to.have.been.called.callCount(1);
    expect(logger.info).to.have.been.calledWithExactly(data, msg);
  });

  it('should log at warn level', async () => {
    const logger = createStubInstance(NullLogger);

    const data = {};
    const msg = 'test';
    logWithLevel(logger, LogLevel.Warn, data, msg);
    expect(logger.warn).to.have.been.called.callCount(1);
    expect(logger.warn).to.have.been.calledWithExactly(data, msg);
  });
});
