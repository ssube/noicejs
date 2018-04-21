import {Constructor, injectionSymbol} from 'src/Container';
import {Dependency, InjectedDependency, resolveDepends} from 'src/Dependency';

export function getProvides(target: any): Array<Dependency> {
  if (Reflect.has(target, injectionSymbol)) {
    return Reflect.get(target, injectionSymbol);
  } else {
    return [];
  }
}

/**
 * Injection decorator for classes.
 */
export function Provides<TInjected>(...provides: Array<InjectedDependency>) {
  return function<T>(target: any, key: keyof T, desc?: PropertyDescriptor) {
    if (!desc) {
      throw new Error('missing descriptor');
    }

    const prev = getProvides(target);
    const next = resolveDepends(provides);
    Reflect.set(desc.value, injectionSymbol, prev.concat(next));
  };
}
