import { BaseError } from './BaseError';

/**
 * A required value is missing.
 *
 * @public
 */
export class MissingValueError extends BaseError {
  constructor(msg = 'required value is null or undefined', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
