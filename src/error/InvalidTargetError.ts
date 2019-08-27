import {BaseError} from './BaseError';

export class InvalidTargetError extends BaseError {
  constructor(msg = 'invalid decorator target', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
