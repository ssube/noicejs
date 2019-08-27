import { expect } from 'chai';

import { InvalidTargetError } from '../src/error/InvalidTargetError';
import { getInject, Inject } from '../src/Inject';

import { describeAsync, itAsync } from './helpers/async';

describeAsync('injection decorator', async () => {
  itAsync('should attach dependencies', async () => {
    class FooClass { /* noop */ }
    const dep = {
      contract: FooClass,
      name: 'foo',
    };

    @Inject(dep)
    class TestClass { /* noop */ }

    expect(getInject(TestClass)).to.deep.equal([dep]);
  });

  itAsync('should handle missing dependencies', async () => {
    class TestClass { /* noop */ }

    expect(getInject(TestClass)).to.deep.equal([]);
  });

  itAsync('should flatten dependencies', async () => {
    class FooClass { /* noop */ }

    @Inject(FooClass)
    class TestClass { /* noop */ }

    expect(getInject(TestClass)).to.deep.equal([{
      contract: FooClass,
      name: FooClass.name,
    }]);
  });

  itAsync('should look up the prototype chain', async () => {
    @Inject('foo')
    class FooClass { /* noop */ }

    @Inject('bar')
    class BarClass extends FooClass { /* noop */ }

    const injected = getInject(BarClass);
    expect(injected.length).to.equal(2);
    expect(injected[0].name, 'first injected option should be from parent class').to.equal('foo');
  });

  itAsync('should fail on missing properties', async () => {
    class TestClass { /* noop */ }

    expect(() => {
      Inject()(TestClass, 'missing');
    }).to.throw();
  });
});
