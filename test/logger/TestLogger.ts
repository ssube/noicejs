import { expect } from 'chai';
import { spy } from 'sinon';
import { describeAsync } from 'test/helpers/async';
import { ineeda } from 'ineeda';
import { Logger, logWithLevel } from 'src/logger/Logger';

describeAsync('log level switch', async () => {
  it('should log at debug level', () => {
    const logger = ineeda<Logger>({
      debug: spy(),
    });

    const data = {};
    const msg = 'test';
    logWithLevel(logger, 'debug', data, msg);
    expect(logger.debug).to.have.been.calledOnce;
    expect(logger.debug).to.have.been.calledWithExactly(data, msg);
  });

  it('should log at error level', () => {
    const logger = ineeda<Logger>({
      error: spy(),
    });

    const data = {};
    const msg = 'test';
    logWithLevel(logger, 'error', data, msg);
    expect(logger.error).to.have.been.calledOnce;
    expect(logger.error).to.have.been.calledWithExactly(data, msg);
  });

  it('should log at info level', () => {
    const logger = ineeda<Logger>({
      info: spy(),
    });

    const data = {};
    const msg = 'test';
    logWithLevel(logger, 'info', data, msg);
    expect(logger.info).to.have.been.calledOnce;
    expect(logger.info).to.have.been.calledWithExactly(data, msg);
  });

  it('should log at warn level', () => {
    const logger = ineeda<Logger>({
      warn: spy(),
    });

    const data = {};
    const msg = 'test';
    logWithLevel(logger, 'warn', data, msg);
    expect(logger.warn).to.have.been.calledOnce;
    expect(logger.warn).to.have.been.calledWithExactly(data, msg);
  });
});
