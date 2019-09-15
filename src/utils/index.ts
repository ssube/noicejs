import { DescriptorNotFoundError } from '../error/DescriptorNotFoundError';
import { MissingValueError } from '../error/MissingValueError';

// these could be pulled from lodash, but that would introduce a dependency...

export function isNil<T>(val: T | null | undefined): val is null | undefined {
  return val === null || val === undefined;
}

export function doesExist<T>(val: T | null | undefined): val is T {
  return !isNil(val);
}

export function mustExist<T>(val: T | null | undefined): T {
  if (isNil(val)) {
    throw new MissingValueError('value must exist');
  }

  return val;
}

/* tslint:disable-next-line:no-any */
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
