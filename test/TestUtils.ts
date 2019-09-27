import { expect } from 'chai';

import { resolveDescriptor } from '../src/utils';
import { describeLeaks, itLeaks } from './helpers/async';

describeLeaks('utils', async () => {
  describeLeaks('resolve descriptor', async () => {
    itLeaks('should describe own properties', async () => {
      const desc = resolveDescriptor({
        a: 1,
        b: 'foo',
      }, 'a');

      expect(desc.value).to.equal(1);
    });
  });
});
