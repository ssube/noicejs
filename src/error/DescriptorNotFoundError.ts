import {BaseError} from 'src/error/BaseError';

export class DescriptorNotFoundError extends BaseError {
  constructor(msg = 'property descriptor not found', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
