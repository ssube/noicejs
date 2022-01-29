import { expect } from 'chai';
import { MissingValueError } from '../src/index.js';

import { mustExist, resolveDescriptor } from '../src/utils/index.js';

describe('utils', async () => {
  describe('resolve descriptor', async () => {
    it('should describe own properties', async () => {
      const desc = resolveDescriptor({
        a: 1,
        b: 'foo',
      }, 'a');

      expect(desc.value).to.equal(1);
    });
  });

  describe('must exist helper', async () => {
    it('should throw on nil values', async () => {
      expect(() => mustExist(null)).to.throw(MissingValueError);
      expect(() => mustExist(undefined)).to.throw(MissingValueError);
    });

    it('should return valid values', async () => {
      const obj = {};
      expect(mustExist(obj)).to.equal(obj);
      expect(mustExist(1)).to.equal(1);
    });
  });
});
