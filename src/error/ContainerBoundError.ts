import {BaseError} from 'src/error/BaseError';

export class ContainerBoundError extends BaseError {
  constructor(msg = 'container is already bound', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
