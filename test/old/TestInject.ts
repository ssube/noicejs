import { expect } from 'chai';
import { getInject, Inject  } from '../../src/Inject';
import { itLeaks } from '../helpers/async';

describe('inject decorator', async () => {
  itLeaks('should return a function', async () => {
    expect(Inject()).to.be.a('function');
  });

  itLeaks('should work as a class decorator', async () => {
    const params = [{
      contract: 'a',
      name: 'a',
    }, {
      contract: 'b',
      name: 'b',
    }, {
      contract: 'c',
      name: 'c',
    }];

    @Inject(...params)
    class Target {
      private method() { /* noop */ }
    }

    expect(getInject(Target)).to.deep.equal(params);
  });
});
