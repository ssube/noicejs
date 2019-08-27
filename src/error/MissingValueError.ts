import {BaseError} from './BaseError';

export class MissingValueError extends BaseError {
  constructor(msg = 'required value is null or undefined', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
