import { expect } from 'chai';

import { Container } from '../../src/Container';
import { Module } from '../../src/Module';
import { getProvides, Provides } from '../../src/Provides';

import { itLeaks } from '../helpers/async';

/* tslint:disable:no-unbound-method */

describe('provides decorator', () => {
  itLeaks('should return a function', async () => {
    expect(Provides()).to.be.a('function');
  });

  itLeaks('should register the method on the class', async () => {
    class Target { }
    class TestModule extends Module {
      public foo() { /* noop */ }
    }

    Provides(Target)(TestModule, 'foo', Object.getOwnPropertyDescriptor(TestModule.prototype, 'foo'));

    const provides = getProvides(TestModule.prototype.foo);
    expect(provides[0].contract).to.deep.equal(Target);
  });

  itLeaks('should work as a method decorator', async () => {
    class Target { }
    class TestModule extends Module {
      @Provides(Target)
      public foo() {
        return 2;
       }
    }

    const module = new TestModule();
    const ctr = Container.from(module);
    await ctr.configure();

    expect(module.get(Target).value).to.equal(TestModule.prototype.foo);
  });
});
