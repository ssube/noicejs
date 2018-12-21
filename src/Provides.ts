import { Dependency, InjectedDependency, resolveDepends } from 'src/Dependency';
import { DescriptorNotFoundError } from 'src/error/DescriptorNotFoundError';

export const providesSymbol = Symbol('noicejs-provides');

export function getProvides(target: any): Array<Dependency> {
  if (Reflect.has(target, providesSymbol)) {
    return Reflect.get(target, providesSymbol);
  } else {
    return [];
  }
}

/**
 * Injection decorator for classes.
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
