import { MissingValueError } from './MissingValueError';

/**
 * Error indicating that a debug method has been called, but no logger was registered for debugging.
 *
 * @public
 */
export class LoggerNotFoundError extends MissingValueError {
  constructor(msg = 'logger not found', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
