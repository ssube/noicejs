import { DescriptorNotFoundError } from '../error/DescriptorNotFoundError.js';
import { MissingValueError } from '../error/MissingValueError.js';

// these could be pulled from js-utils, but that would introduce a dependency...

/* eslint-disable-next-line @typescript-eslint/ban-types */
export type Maybe<TValue> = TValue | null | undefined;

/* eslint-disable-next-line @typescript-eslint/ban-types */
export function isNil<T>(val: Maybe<T>): val is null | undefined {
  /* eslint-disable-next-line no-null/no-null */
  return val === null || val === undefined;
}

export function doesExist<T>(val: Maybe<T>): val is T {
  return !isNil(val);
}

export function mustExist<T>(val: Maybe<T>): T {
  if (isNil(val)) {
    throw new MissingValueError('value must exist');
  }

  return val;
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function resolveDescriptor(target: any, key: string, providedDescriptor?: PropertyDescriptor): PropertyDescriptor {
  if (doesExist(providedDescriptor)) {
    return providedDescriptor;
  }

  const desc = Reflect.getOwnPropertyDescriptor(target, key);
  if (doesExist(desc)) {
    return desc;
  }

  const proto = Reflect.getPrototypeOf(target);
  if (doesExist(proto)) {
    return resolveDescriptor(proto, key);
  }

  throw new DescriptorNotFoundError();
}
