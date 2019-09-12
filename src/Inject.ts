import { Dependency, InjectedDependency, resolveDepends } from './Dependency';
import { DescriptorNotFoundError } from './error/DescriptorNotFoundError';
import { InvalidTargetError } from './error/InvalidTargetError';
import { isNil } from './utils';

export const injectionSymbol = Symbol('noicejs-inject');

/**
 * Get attached dependencies.
 *
 * @param target - the previously-decorated target
 *
 * @public
 */
/* tslint:disable-next-line:no-any */
export function getInject(target: any): Array<Dependency> {
  if (Reflect.has(target, injectionSymbol)) {
    const existing = Reflect.get(target, injectionSymbol);
    if (Array.isArray(existing)) {
      return existing;
    }
  } else {
    // first dep for this target, check prototype
    const proto = Reflect.getPrototypeOf(target);
    if (!isNil(proto) && proto !== target) {
      return getInject(proto);
    }
  }

  return [];
}

/**
 * Injection decorator for classes.
 *
 * @param needs - dependencies required by the decorated target
 *
 * @public
 */
export function Inject(...needs: Array<InjectedDependency>) {
  /* tslint:disable-next-line:no-any */
  return (target: any, key?: string, desc?: PropertyDescriptor) => {
    if (isNil(key)) {
      const prev = getInject(target);
      const next = resolveDepends(needs);
      Reflect.set(target, injectionSymbol, prev.concat(next));
    } else {
      let prop = desc;
      if (isNil(prop)) {
        prop = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), key);
      }

      if (isNil(prop)) {
        throw new DescriptorNotFoundError('cannot get descriptor');
      }

      if (typeof prop.value !== 'function') {
        throw new InvalidTargetError('method decorator cannot inject properties');
      }

      const prev = getInject(prop.value);
      const next = resolveDepends(needs);
      Reflect.set(prop.value, injectionSymbol, prev.concat(next));
    }
  };
}
