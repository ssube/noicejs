import { expect } from 'chai';

import { resolveDescriptor } from '../src/utils';

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
});
