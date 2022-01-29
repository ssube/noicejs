import { expect } from 'chai';

import { BaseOptions, Container, DescriptorNotFoundError, InvalidTargetError, Module } from '../src/index.js';
import { getInject, Inject, injectionSymbol } from '../src/Inject.js';

/* eslint-disable @typescript-eslint/unbound-method */
describe('inject decorator', async () => {
  it('should be a decorator factory', async () => {
    expect(Inject()).to.be.a('function');
  });

  it('should work as a class decorator', async () => {
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
      /* c8 ignore next */
      private method() { /* noop */ }
    }

    expect(getInject(Target)).to.deep.equal(params);
  });

  it('should attach dependencies', async () => {
    class FooClass { /* noop */ }
    const dep = {
      contract: FooClass,
      name: 'foo',
    };

    @Inject(dep)
    class TestClass { /* noop */ }

    expect(getInject(TestClass)).to.deep.equal([dep]);
  });

  it('should handle missing dependencies', async () => {
    class TestClass { /* noop */ }

    expect(getInject(TestClass)).to.deep.equal([]);
  });

  it('should flatten dependencies', async () => {
    class FooClass { /* noop */ }

    @Inject(FooClass)
    class TestClass { /* noop */ }

    expect(getInject(TestClass)).to.deep.equal([{
      contract: FooClass,
      name: FooClass.name,
    }]);
  });

  it('should look up the prototype chain', async () => {
    @Inject('foo')
    class FooClass { /* noop */ }

    @Inject('bar')
    class BarClass extends FooClass { /* noop */ }

    const EXPECTED_INJECTED = 2;
    const injected = getInject(BarClass);
    expect(injected.length).to.equal(EXPECTED_INJECTED);
    expect(injected[0].name, 'first injected option should be from parent class').to.equal('foo');
  });

  it('should fail on missing properties', async () => {
    class TestClass { /* noop */ }

    expect(() => {
      Inject()(TestClass, 'missing');
    }).to.throw();
  });

  it('should work when applied to methods', async () => {
    class TestClass {
      public foo: string;

      constructor() {
        this.foo = '';
      }

      @Inject('foo')
      public bar(options: { foo: string }) {
        this.foo = options.foo;
      }
    }

    class TestModule extends Module {
      public async configure(options: BaseOptions) {
        await super.configure(options);

        this.bind('foo').toInstance('test');
      }
    }

    const ctr = Container.from(new TestModule());
    await ctr.configure();

    const foo = new TestClass();
    /* tslint:disable-next-line:no-unbound-method */
    await ctr.apply(foo.bar, foo, {}, []);
    expect(foo.foo).to.equal('test');
  });

  it('cannot be applied to non-function properties', async () => {
    expect(() => {
      /* c8 ignore next 4 */
      class TestField {
        @Inject('foo')
        public readonly foo: string = '';
      }

      const foo = new TestField();
      expect(foo).to.equal(undefined);
    }).to.throw(DescriptorNotFoundError);
  });

  it('should throw when used on a property', async () => {
    const foo = {
      a: 1,
    };

    expect(() => {
      Inject('bar')(foo, 'a');
    }).to.throw(InvalidTargetError);
  });

  it('should return an empty array on undecorated classes', async () => {
    class Foo {}
    Reflect.set(Foo, injectionSymbol, {});
    expect(getInject(Foo)).to.deep.equal([]);
  });
});
