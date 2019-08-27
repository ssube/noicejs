import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { spy } from 'sinon';

import { Logger, logWithLevel } from '../../src/logger/Logger';

import { describeAsync } from '../helpers/async';

describeAsync('log level switch', async () => {
  it('should log at debug level', () => {
    const logger = ineeda<Logger>({
      debug: spy(),
    });

    const data = {};
    const msg = 'test';
    logWithLevel(logger, 'debug', data, msg);
    expect(logger.debug).to.have.been.called.callCount(1);
    expect(logger.debug).to.have.been.calledWithExactly(data, msg);
  });

  it('should log at error level', () => {
    const logger = ineeda<Logger>({
      error: spy(),
    });

    const data = {};
    const msg = 'test';
    logWithLevel(logger, 'error', data, msg);
    expect(logger.error).to.have.been.called.callCount(1);
    expect(logger.error).to.have.been.calledWithExactly(data, msg);
  });

  it('should log at info level', () => {
    const logger = ineeda<Logger>({
      info: spy(),
    });

    const data = {};
    const msg = 'test';
    logWithLevel(logger, 'info', data, msg);
    expect(logger.info).to.have.been.called.callCount(1);
    expect(logger.info).to.have.been.calledWithExactly(data, msg);
  });

  it('should log at warn level', () => {
    const logger = ineeda<Logger>({
      warn: spy(),
    });

    const data = {};
    const msg = 'test';
    logWithLevel(logger, 'warn', data, msg);
    expect(logger.warn).to.have.been.called.callCount(1);
    expect(logger.warn).to.have.been.calledWithExactly(data, msg);
  });
});
