import {expect} from 'chai';
import {spy} from 'sinon';

import {describeLeaks, itLeaks} from './async';

describeLeaks('test helpers', async () => {
  itLeaks('should wrap suites');
  itLeaks('should wrap tests');
});
