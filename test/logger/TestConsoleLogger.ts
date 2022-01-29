import { expect } from 'chai';
import { restore, spy } from 'sinon';

import { ConsoleLogger } from '../../src/logger/ConsoleLogger.js';

/* eslint-disable no-console, @typescript-eslint/unbound-method */

describe('console logger', async () => {
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
    expect(ConsoleLogger.global.child()).to.equal(ConsoleLogger.global);
  });

  it('should log at debug level', () => {
    const data = {};
    const msg = 'debug';
    ConsoleLogger.global.debug(data, msg);

    expect(console.debug).to.have.callCount(1);
    expect(console.debug).to.have.been.calledWithExactly(data, msg);

    expect(console.error).to.have.callCount(0);
    expect(console.info).to.have.callCount(0);
    expect(console.log).to.have.callCount(0);
    expect(console.warn).to.have.callCount(0);
  });

  it('should log at error level', () => {
    const data = {};
    const msg = 'error';
    ConsoleLogger.global.error(data, msg);

    expect(console.error).to.have.callCount(1);
    expect(console.error).to.have.been.calledWithExactly(data, msg);

    expect(console.debug).to.have.callCount(0);
    expect(console.info).to.have.callCount(0);
    expect(console.log).to.have.callCount(0);
    expect(console.warn).to.have.callCount(0);
  });

  it('should log at info level', () => {
    const data = {};
    const msg = 'info';
    ConsoleLogger.global.info(data, msg);

    expect(console.info).to.have.callCount(1);
    expect(console.info).to.have.been.calledWithExactly(data, msg);

    expect(console.debug).to.have.callCount(0);
    expect(console.error).to.have.callCount(0);
    expect(console.log).to.have.callCount(0);
    expect(console.warn).to.have.callCount(0);
  });

  it('should log at warn level', () => {
    const data = {};
    const msg = 'warn';
    ConsoleLogger.global.warn(data, msg);

    expect(console.warn).to.have.callCount(1);
    expect(console.warn).to.have.been.calledWithExactly(data, msg);

    expect(console.debug).to.have.callCount(0);
    expect(console.error).to.have.callCount(0);
    expect(console.info).to.have.callCount(0);
    expect(console.log).to.have.callCount(0);
  });
});
