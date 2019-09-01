import { BaseError } from './BaseError';

/**
 * No logger has been registered for debugging.
 *
 * @public
 */
export class LoggerNotFoundError extends BaseError {
  constructor(msg = 'logger not found', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
