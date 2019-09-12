import { MissingValueError } from '../error/MissingValueError';

// these could be pulled from lodash, but that would introduce a dependency...

export function isNil<T>(val: T | null | undefined): val is null | undefined {
  return val === null || val === undefined;
}

export function mustExist<T>(val: T | null | undefined): val is T {
  if (isNil(val)) {
    throw new MissingValueError('value must exist');
  }

  return true;
}
