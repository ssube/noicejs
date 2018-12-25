import { Dependency, InjectedDependency, resolveDepends } from 'src/Dependency';
import { DescriptorNotFoundError } from 'src/error/DescriptorNotFoundError';
import { InvalidTargetError } from 'src/error/InvalidTargetError';

export const injectionSymbol = Symbol('noicejs-inject');

export function getInject(target: any): Array<Dependency> {
  if (Reflect.has(target, injectionSymbol)) {
    const existing = Reflect.get(target, injectionSymbol);
    if (Array.isArray(existing)) {
      return existing;
    }
  } else {
    // first dep for this target, check prototype
    const proto = Reflect.getPrototypeOf(target);
    if (proto && proto !== target) {
      return getInject(proto);
    }
  }

  return [];
}

/**
 * Injection decorator for classes.
 */
export function Inject(...needs: Array<InjectedDependency>) {
  return (target: any, key?: string, desc?: PropertyDescriptor) => {
    if (key) {
      const prop = desc || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), key);
      if (!prop) {
        throw new DescriptorNotFoundError('cannot get method descriptor');
      }
      if (typeof prop.value !== 'function') {
        throw new InvalidTargetError('method decorator cannot inject properties');
      }

      const prev = getInject(prop.value);
      const next = resolveDepends(needs);
      Reflect.set(prop.value, injectionSymbol, prev.concat(next));
    } else {
      const prev = getInject(target);
      const next = resolveDepends(needs);
      Reflect.set(target, injectionSymbol, prev.concat(next));
    }
  };
}
