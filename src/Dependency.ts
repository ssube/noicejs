import { AnyContract, contractName, isConstructor } from './Container';

export interface Dependency {
  name: string | symbol;
  contract: AnyContract;
}

export interface Descriptor {
  requires: Array<Dependency>;
}

export type InjectedDependency = Dependency | AnyContract;

/**
 * Convert an InjectedDependency into a regular Dependency
 */
export function resolveDepends(deps: Array<InjectedDependency>): Array<Dependency> {
  return deps.map((contract: InjectedDependency) => {
    if (isConstructor(contract)) {
      return {
        contract,
        name: contractName(contract),
      };
    }

    if (typeof contract === 'string') {
      return {
        contract,
        name: contract,
      };
    }

    if (typeof contract === 'symbol') {
      return {
        contract,
        name: contract,
      };
    }

    return contract;
  });
}
