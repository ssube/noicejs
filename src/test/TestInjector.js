import {expect} from 'chai';
import {Inject, Injector, Module, Provides} from '../main/inject';
import {Interface, Implementation, Consumer, TestModule} from './HelperClass';

describe('Injector class', () => {
  it('should take a list of modules', () => {
    class SubModule extends Module {
      configure() {
        // noop
      }
    }

    const modules = [new SubModule(), new SubModule()];
    const injector = new Injector(...modules);

    expect(injector.modules).to.deep.equal(modules);
  });

  it('should inject a dependency from a module', () => {
    const inj = new Injector(new TestModule());
    const impl = inj.create(Consumer);

    expect(impl._iface).to.be.an.instanceof(Implementation);
  });

  it('should inject a dependency into a factory method', () => {
    const inj = new Injector(new TestModule());
    const impl = inj.execute(Consumer.create, null, [3]);

    expect(impl._iface).to.be.an.instanceof(Implementation);
    expect(impl._args).to.deep.equal([3]);
  });

  it('should throw on missing dependencies', () => {
    class Outerface { /* empty */ }

    // TestModule does not provide Outerface (it can't possibly)
    const inj = new Injector(new TestModule());

    @Inject(Outerface)
    class FailingConsumer {
      constructor(di) {
        this.di = di;
      }
    }

    expect(() => {
      inj.create(FailingConsumer);
    }).to.throw();
  });

  it('should pass arguments to the constructor', () => {
    const inj = new Injector(new TestModule());
    const args = ['a', 'b', 'c'];
    const impl = inj.create(Consumer, ...args);

    expect(impl._args).to.deep.equal(args);
  });

  it('should execute providers', () => {
    let counter = 0;

    class SubModule extends Module {
      configure() {
        // noop
      }

      @Provides(Interface)
      create() {
        ++counter;
        return new Implementation();
      }
    }

    const inj = new Injector(new SubModule());
    const impl = inj.create(Consumer);

    expect(impl._iface).to.be.an.instanceof(Implementation);
    expect(counter).to.equal(1);
  });

  it('should provide dependencies to providers', () => {
    class Outerface { /* empty */ }

    let counter = 0, outerInstance = new Outerface();

    class SubModule extends Module {
      configure() {
        this.bind(Outerface).to(outerInstance);
      }

      @Inject(Outerface)
      @Provides(Interface)
      create(outer) {
        ++counter;
        return new Implementation(outer);
      }
    }

    const inj = new Injector(new SubModule());
    const impl = inj.create(Consumer);

    expect(impl._iface).to.be.an.instanceof(Implementation);
    expect(impl._iface._args).to.deep.equal([outerInstance]);
    expect(counter).to.equal(1);
  });

  it('should invoke binding functions', () => {
    let counter = 0;

    class SubModule extends Module {
      configure() {
        this.bind(Interface).to((...args) => {
          ++counter;
          return new Implementation(...args);
        });
      }
    }

    const inj = new Injector(new SubModule());
    const impl = inj.create(Consumer);

    expect(impl._iface).to.be.an.instanceof(Implementation);
    expect(counter).to.equal(1);
  });

  it('should allow named bindings', () => {
    const name = 'foobar', inst = {};

    class SubModule extends Module {
      configure() {
        this.bind(name).to(inst);
      }
    }

    const inj = new Injector(new SubModule());

    @Inject(name)
    class NameConsumer {
      constructor(arg0) {
        this.arg0 = arg0;
      }
    }

    const impl = inj.create(NameConsumer);
    expect(impl.arg0).to.equal(inst);
  })
});
