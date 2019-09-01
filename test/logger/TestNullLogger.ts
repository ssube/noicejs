import { expect } from 'chai';
import { restore, spy } from 'sinon';

import { NullLogger } from '../../src/logger/NullLogger';
import { describeAsync } from '../helpers/async';

describeAsync('console logger', async () => {
  beforeEach(() => {
    spy(console, 'debug');
    spy(console, 'error');
    spy(console, 'info');
    spy(console, 'log');
    spy(console, 'warn');
  });

  afterEach(() => {
    restore();
  });

  it('should return the global singleton for children', () => {
    expect(NullLogger.global.child()).to.equal(NullLogger.global);
  });

  it('should log at debug level', () => {
    const data = {};
    const msg = 'debug';
    NullLogger.global.debug(data, msg);
  });

  it('should log at error level', () => {
    const data = {};
    const msg = 'error';
    NullLogger.global.error(data, msg);
  });

  it('should log at info level', () => {
    const data = {};
    const msg = 'info';
    NullLogger.global.info(data, msg);
  });

  it('should log at warn level', () => {
    const data = {};
    const msg = 'warn';
    NullLogger.global.warn(data, msg);
  });
});
