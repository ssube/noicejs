import { BaseError } from './BaseError.js';

/**
 * Error indicating that the decorator target is not valid.
 *
 * @public
 */
export class InvalidTargetError extends BaseError {
  constructor(msg = 'invalid decorator target', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
