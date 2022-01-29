import { BaseError } from './BaseError.js';

/**
 * Error indicating that the target descriptor could not be found on the decorator target.
 *
 * @public
 */
export class DescriptorNotFoundError extends BaseError {
  constructor(msg = 'property descriptor not found', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
