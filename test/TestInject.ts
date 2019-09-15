import { expect } from 'chai';

import { BaseOptions, Container, DescriptorNotFoundError, Module } from '../src';
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

  itAsync('should work when applied to methods', async () => {
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

  itAsync('cannot be applied to non-function properties', async () => {
    expect(() => {
      class TestClass {
        @Inject('foo')
        public readonly foo: string = '';

        constructor() {
          this.foo = 'foo';
        }
      }

      const foo = new TestClass();
      expect(foo).to.equal(undefined);
    }).to.throw(DescriptorNotFoundError);
  });
});
