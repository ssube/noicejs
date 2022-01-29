import { expect } from 'chai';
import { restore, spy } from 'sinon';

import { NullLogger } from '../../src/logger/NullLogger.js';

describe('null logger', async () => {
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

  it('should return the global singleton for children', async () => {
    expect(NullLogger.global.child()).to.equal(NullLogger.global);
  });

  it('should log at debug level', async () => {
    const data = {};
    const msg = 'debug';
    NullLogger.global.debug(data, msg);
  });

  it('should log at error level', async () => {
    const data = {};
    const msg = 'error';
    NullLogger.global.error(data, msg);
  });

  it('should log at info level', async () => {
    const data = {};
    const msg = 'info';
    NullLogger.global.info(data, msg);
  });

  it('should log at warn level', async () => {
    const data = {};
    const msg = 'warn';
    NullLogger.global.warn(data, msg);
  });
});
