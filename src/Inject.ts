import {Constructor, Contract, contractName, getDependencies, injectionSymbol, isConstructor} from 'src/Container';
import {Dependency} from 'src/Dependency';

export type InjectedDependency = Dependency | Constructor<any, any>;

export function normalizeDependencies(deps: Array<InjectedDependency>): Array<Dependency> {
  return deps.map((contract: InjectedDependency) => {
    if (isConstructor(contract)) {
      return {
        contract,
        name: contractName(contract)
      };
    } else {
      return contract;
    }
  });
}

/**
 * Injection decorator for classes.
 */
export function Inject<TInjected>(...needs: Array<InjectedDependency>) {
  return (target: Constructor<TInjected, any>) => {
    const prev = getDependencies(target);
    const next = normalizeDependencies(needs);
    Reflect.set(target, injectionSymbol, prev.concat(next));
  };
}
