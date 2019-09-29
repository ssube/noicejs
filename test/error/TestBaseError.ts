import { expect } from 'chai';

import { BaseError } from '../../src/error/BaseError';

describe('base error', () => {
  it('should include nested errors in the stack trace', () => {
    const inner = new Error('inner error');
    const err = new BaseError('outer error', inner);
    expect(err.stack).to.include('inner', 'inner error message').and.include('outer', 'outer error message');
  });

  it('should have the nested error', () => {
    const inner = new Error('inner error');
    const err = new BaseError('outer error', inner);
    expect(err.cause()).to.equal(inner);
    expect(err.length).to.equal(1);
  });

  it('should work when the base error does not have a stack', () => {
    class EmptyError extends BaseError {
      public stack?: string;

      constructor(msg: string) {
        super(msg);
        this.stack = undefined;
      }
    }

    const nextError = new BaseError('empty error', new EmptyError('also empty'));
    expect(nextError.stack).not.to.include('also empty');
  });
});
