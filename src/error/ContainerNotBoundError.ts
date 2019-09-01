import { BaseError } from './BaseError';

/**
 * Container is not bound yet and not ready to be used.
 *
 * @public
 */
export class ContainerNotBoundError extends BaseError {
  constructor(msg = 'container is not bound', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
