import { Constructor, Contract, contractName, injectionSymbol, isConstructor } from 'src/Container';
import { Dependency, getDepends, InjectedDependency, resolveDepends } from 'src/Dependency';

/**
 * Injection decorator for classes.
 */
export function Inject<TInjected>(...needs: Array<InjectedDependency>) {
  return (target: Constructor<TInjected, any>) => {
    const prev = getDepends(target);
    const next = resolveDepends(needs);
    Reflect.set(target, injectionSymbol, prev.concat(next));
  };
}
