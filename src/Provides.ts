import { Dependency, InjectedDependency, resolveDepends } from './Dependency.js';
import { resolveDescriptor } from './utils/index.js';

/* eslint-disable @typescript-eslint/no-explicit-any */

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
  return (target: any, key: string, providedDesc?: PropertyDescriptor) => {
    const desc = resolveDescriptor(target, key, providedDesc);
    const prev = getProvides(target);
    const next = resolveDepends(provides);
    Reflect.set(desc.value, providesSymbol, prev.concat(next));
  };
}
