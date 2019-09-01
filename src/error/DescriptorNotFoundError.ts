import { BaseError } from './BaseError';

/**
 * The decorator property has no descriptor on the decorator target.
 *
 * This should not normally occur and may be an artifact of syntax errors.
 *
 * @public
 */
export class DescriptorNotFoundError extends BaseError {
  constructor(msg = 'property descriptor not found', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
