import {expect} from 'chai';
import {Inject, Injector, Module, Provides} from '../main/inject';

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
    const iface = {}, inst = {};
    class SubModule extends Module {
      configure() {
        this.bind(iface).to(inst);
      }
    }
    const inj = new Injector(new SubModule());

    @Inject(iface)
    class Impl {
      constructor(di) {
        this.di = di;
      }
    }

    const impl = inj.create(Impl);
    expect(impl.di).to.equal(inst);
  });

  it('should throw on missing dependencies', () => {
    const iface = {}, oface = {}, inst = {};
    class SubModule extends Module {
      configure() {
        this.bind(iface).to(inst);
      }
    }
    const inj = new Injector(new SubModule());

    @Inject(oface)
    class Impl {
      constructor(di) {
        this.di = di;
      }
    }

    expect(() => {
      inj.create(Impl);
    }).to.throw();
  });

  it('should pass arguments to the constructor', () => {
    const iface = {}, inst = {};
    class SubModule extends Module {
      configure() {
        this.bind(iface).to(inst);
      }
    }
    const inj = new Injector(new SubModule());

    @Inject(iface)
    class Impl {
      constructor(di, ...a) {
        this.di = di;
        this.a = a;
      }
    }

    const args = ['a', 'b', 'c'];
    const impl = inj.create(Impl, ...args);
    expect(impl.a).to.deep.equal(args);
  });

  it('should execute providers', () => {
    const iface = {}, inst = {};
    let counter = 0;

    class SubModule extends Module {
      configure() {
        // noop
      }

      @Provides(iface)
      create() {
        ++counter;
        return inst;
      }
    }

    const inj = new Injector(new SubModule());

    @Inject(iface)
    class Impl {
      constructor(di) {
        this.di = di;
      }
    }

    const impl = inj.create(Impl);
    expect(impl.di).to.deep.equal(inst);
    expect(counter).to.equal(1);
  });

  it('should provide dependencies to providers', () => {
    const iface = {}, oface = {}, oinst = {};
    let counter = 0;

    class SubModule extends Module {
      configure() {
        this.bind(oface).to(oinst);
      }

      @Inject(oface)
      @Provides(iface)
      create(o) {
        ++counter;
        return new Impl(o);
      }
    }

    const inj = new Injector(new SubModule());

    @Inject(iface)
    class Impl {
      constructor(di) {
        this.di = di;
      }
    }

    const impl = inj.create(Impl);
    expect(impl).to.be.an.instanceOf(Impl);
    expect(impl.di).to.be.an.instanceOf(Impl);
    expect(impl.di.di).to.equal(oinst);
    expect(counter).to.equal(1);
  });
});
