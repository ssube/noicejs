import {BaseError} from 'src/error/BaseError';

export class InvalidProviderError extends BaseError {
  constructor(msg = 'invalid provider type', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
