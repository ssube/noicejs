import { BaseError } from './BaseError.js';

/**
 * Error indicating that a required value is missing.
 *
 * @public
 */
export class MissingValueError extends BaseError {
  constructor(msg = 'required value is null or undefined', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
