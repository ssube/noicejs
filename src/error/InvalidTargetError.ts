import {BaseError} from 'src/error/BaseError';

export class InvalidTargetError extends BaseError {
  constructor(msg = 'invalid decorator target', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
