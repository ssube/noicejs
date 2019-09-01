import { Dependency, InjectedDependency, resolveDepends } from './Dependency';
import { DescriptorNotFoundError } from './error/DescriptorNotFoundError';

export const providesSymbol = Symbol('noicejs-provides');

/**
 * Get dependencies provided by this previously-decorated target.
 *
 * @param target - the decorated target
 *
 * @public
 */
export function getProvides(target: any): Array<Dependency> {
  if (Reflect.has(target, providesSymbol)) {
    return Reflect.get(target, providesSymbol);
  } else {
    return [];
  }
}

/**
 * Decorator for methods that can resolve or provide some dependency.
 *
 * @public
 */
export function Provides<TInjected>(...provides: Array<InjectedDependency>) {
  return (target: any, key: string, desc?: PropertyDescriptor) => {
    if (!desc) {
      throw new DescriptorNotFoundError();
    }

    const prev = getProvides(target);
    const next = resolveDepends(provides);
    Reflect.set(desc.value, providesSymbol, prev.concat(next));
  };
}
