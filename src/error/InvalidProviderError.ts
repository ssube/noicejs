import { BaseError } from './BaseError.js';

/**
 * Error indicating that the container was able to find a provider, but did not understand the provider type and could
 * not use it to fulfill the dependency.
 *
 * This should not normally occur, unless custom provider types are in use.
 *
 * @public
 */
export class InvalidProviderError extends BaseError {
  constructor(msg = 'invalid provider type', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
