import { BaseError } from './BaseError.js';

/**
 * Error indicating that this container is not bound yet and not ready to be used.
 *
 * @public
 */
export class ContainerNotBoundError extends BaseError {
  constructor(msg = 'container is not bound', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
