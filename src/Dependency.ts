import { Contract, contractName, isConstructor } from './Container';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Dependency {
  name: string | symbol;
  contract: Contract<any, any>;
}

export interface Descriptor {
  requires: Array<Dependency>;
}

export type InjectedDependency = Dependency | Contract<any, any>;

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
