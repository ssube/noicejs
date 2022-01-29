import { expect } from 'chai';

import { ContainerBoundError } from '../../src/error/ContainerBoundError.js';
import { ContainerNotBoundError } from '../../src/error/ContainerNotBoundError.js';
import { DescriptorNotFoundError } from '../../src/error/DescriptorNotFoundError.js';
import { InvalidProviderError } from '../../src/error/InvalidProviderError.js';
import { InvalidTargetError } from '../../src/error/InvalidTargetError.js';
import { LoggerNotFoundError } from '../../src/error/LoggerNotFoundError.js';
import { MissingValueError } from '../../src/error/MissingValueError.js';

const errors = [
  ContainerBoundError,
  ContainerNotBoundError,
  DescriptorNotFoundError,
  InvalidProviderError,
  InvalidTargetError,
  LoggerNotFoundError,
  MissingValueError,
];

describe('errors', () => {
  for (const errorType of errors) {
    describe(errorType.name, () => {
      it('should have a message', async () => {
        const err = new errorType();
        expect(err.message).to.not.equal('');
      });

      it('should include nested errors in the stack trace', async () => {
        const inner = new Error('inner error');
        const err = new errorType('outer error', inner);
        expect(err.stack).to.include('inner', 'inner error message').and.include('outer', 'outer error message');
      });

      it('should have the nested error', async () => {
        const inner = new Error('inner error');
        const err = new errorType('outer error', inner);
        expect(err.cause()).to.equal(inner);
        expect(err.length).to.equal(1);
      });
    });
  }
});
