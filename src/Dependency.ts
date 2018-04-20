import {Contract, injectionSymbol} from 'src/Container';

export interface Dependency {
  name: string;
  contract: Contract<any>;
}

export interface Descriptor {
  requires: Array<Dependency>;
}

/**
 * Attach a descriptor to a target constructor.
 * @param target
 * @param descriptor
 */
export function dependsOn(target: Function, descriptor: Descriptor): void {
  Reflect.set(target, injectionSymbol, descriptor);
}
