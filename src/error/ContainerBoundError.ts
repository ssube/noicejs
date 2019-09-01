import { BaseError } from './BaseError';

/**
 * Container is already bound and cannot be bound again.
 *
 * @public
 */
export class ContainerBoundError extends BaseError {
  constructor(msg = 'container is already bound', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
