import {expect} from 'chai';
import {spy} from 'sinon';

import {describeAsync, itAsync} from './async';

describeAsync('test helpers', async () => {
  itAsync('should wrap suites');
  itAsync('should wrap tests');
});
