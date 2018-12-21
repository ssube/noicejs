import {BaseError} from 'src/error/BaseError';

export class LoggerNotFoundError extends BaseError {
  constructor(msg = 'logger not found', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
