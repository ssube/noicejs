import {isString} from 'lodash';

import {Constructor, Contract, contractName, isConstructor} from 'src/Container';

export interface Dependency {
  name: string;
  contract: Contract<any>;
}

export interface Descriptor {
  requires: Array<Dependency>;
}

export type InjectedDependency = Dependency | Constructor<any, any> | string;

/**
 * Convert an InjectedDependency into a regular Dependency
 */
export function resolveDepends(deps: Array<InjectedDependency>): Array<Dependency> {
  return deps.map((contract: InjectedDependency) => {
    if (isConstructor(contract)) {
      return {
        contract,
        name: contractName(contract)
      };
    } else if (isString(contract)) {
      return {
        contract,
        name: contract
      };
    } else {
      return contract;
    }
  });
}
