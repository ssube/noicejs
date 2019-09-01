import { BaseError } from './BaseError';

/**
 * Container does not understand the provider it found.
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
