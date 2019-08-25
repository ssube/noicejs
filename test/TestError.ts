import { expect } from 'chai';
import { kebabCase } from 'lodash';

import { ContainerBoundError } from 'src/error/ContainerBoundError';
import { ContainerNotBoundError } from 'src/error/ContainerNotBoundError';
import { DescriptorNotFoundError } from 'src/error/DescriptorNotFoundError';
import { InvalidProviderError } from 'src/error/InvalidProviderError';
import { InvalidTargetError } from 'src/error/InvalidTargetError';
import { LoggerNotFoundError } from 'src/error/LoggerNotFoundError';
import { MissingValueError } from 'src/error/MissingValueError';

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
    describe(kebabCase(errorType.name), () => {
      it('should have a message', () => {
        const err = new errorType();
        expect(err.message).to.not.equal('');
      });
    });
  }
});
