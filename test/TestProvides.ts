import { expect } from 'chai';

import { Container } from '../src/Container';
import { Module } from '../src/Module';
import { getProvides, Provides } from '../src/Provides';

/* eslint-disable @typescript-eslint/unbound-method */

describe('provides decorator', () => {
  it('should return a function', async () => {
    expect(Provides()).to.be.a('function');
  });

  it('should register the method on the class', async () => {
    class Target { }
    class TestModule extends Module {
      public foo() { /* noop */ }
    }

    Provides(Target)(TestModule, 'foo', Object.getOwnPropertyDescriptor(TestModule.prototype, 'foo'));

    const provides = getProvides(TestModule.prototype.foo);
    expect(provides[0].contract).to.deep.equal(Target);
  });

  it('should work as a method decorator', async () => {
    class Target { }
    class TestModule extends Module {
      @Provides(Target)
      public foo() {
        return Math.random();
      }
    }

    const module = new TestModule();
    const ctr = Container.from(module);
    await ctr.configure();

    expect(module.get(Target).value).to.equal(TestModule.prototype.foo);
  });
});
