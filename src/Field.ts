import { ContractName } from './Container.js';
import { Dependency } from './Dependency.js';
import { InvalidTargetError } from './error/InvalidTargetError.js';
import { doesExist, isNil, resolveDescriptor } from './utils/index.js';

export const fieldSymbol = Symbol('noicejs-field');

/**
 * Get attached dependencies.
 *
 * @param target - the previously-decorated target
 *
 * @public
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function getFields(target: any): Array<Dependency> {
  if (Reflect.has(target, fieldSymbol)) {
    const existing = Reflect.get(target, fieldSymbol);
    if (Array.isArray(existing)) {
      return existing;
    }
  } else {
    // first dep for this target, check prototype
    const proto = Reflect.getPrototypeOf(target);
    if (doesExist(proto) && proto !== target) {
      return getFields(proto);
    }
  }

  return [];
}

/**
 * Injection decorator for classes.
 *
 * @param needs - dependencies required by the decorated target
 *
 * @public
 */
export function Field(gets: ContractName) {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  return (target: any, key?: string, providedDesc?: PropertyDescriptor) => {
    if (isNil(key)) {
      throw new InvalidTargetError('field decorator must be used on a field');
    } else {
      // is this worth checking?
      const desc = resolveDescriptor(target, key, providedDesc);
      if (typeof desc.value === 'function') {
        throw new InvalidTargetError('field decorator cannot inject methods');
      }

      const fields = getFields(target);
      const prev = fields.find((it) => it.name === key);

      if (doesExist(prev)) {
        prev.contract = gets;
      } else {
        fields.push({
          contract: gets,
          name: key,
        });
      }

      Reflect.set(desc.value, fieldSymbol, prev);
    }
  };
}
