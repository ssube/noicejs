import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { spy } from 'sinon';

import { Logger, LogLevel, logWithLevel } from '../../src/logger/Logger';
import { describeLeaks } from '../helpers/async';

/* tslint:disable:no-unbound-method */

describeLeaks('log level switch', async () => {
  it('should log at debug level', () => {
    const logger = ineeda<Logger>({
      debug: spy(),
    });

    const data = {};
    const msg = 'test';
    logWithLevel(logger, LogLevel.Debug, data, msg);
    expect(logger.debug).to.have.been.called.callCount(1);
    expect(logger.debug).to.have.been.calledWithExactly(data, msg);
  });

  it('should log at error level', () => {
    const logger = ineeda<Logger>({
      error: spy(),
    });

    const data = {};
    const msg = 'test';
    logWithLevel(logger, LogLevel.Error, data, msg);
    expect(logger.error).to.have.been.called.callCount(1);
    expect(logger.error).to.have.been.calledWithExactly(data, msg);
  });

  it('should log at info level', () => {
    const logger = ineeda<Logger>({
      info: spy(),
    });

    const data = {};
    const msg = 'test';
    logWithLevel(logger, LogLevel.Info, data, msg);
    expect(logger.info).to.have.been.called.callCount(1);
    expect(logger.info).to.have.been.calledWithExactly(data, msg);
  });

  it('should log at warn level', () => {
    const logger = ineeda<Logger>({
      warn: spy(),
    });

    const data = {};
    const msg = 'test';
    logWithLevel(logger, LogLevel.Warn, data, msg);
    expect(logger.warn).to.have.been.called.callCount(1);
    expect(logger.warn).to.have.been.calledWithExactly(data, msg);
  });
});
