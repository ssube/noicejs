import {expect} from 'chai';
import {Module} from '../main/inject';

describe('Module class', () => {
  it('should start with no bindings', () => {
    expect(new Module().bindings.size).to.equal(0);
  });

  it('should bind an interface and return a to function', () => {
    const iface = {}, keys = ['to'];
    expect(Object.keys(new Module().bind(iface))).to.deep.equal(keys);
  });

  it('should bind an interface to an implementation', () => {
    const iface = {}, impl = {}, module = new Module();
    module.bind(iface).to(impl);
    expect(module.bindings.get(iface)).to.equal(impl);
  });

  it('should throw on configure', () => {
    expect(() => {
      new Module().configure();
    }).to.throw();
  });

  it('should return instance bindings', () => {
    const iface = {}, impl = {};

    class SubModule extends Module {
      configure() {
        this.bind(iface).to(impl);
      }
    }

    const module = new SubModule();
    module.configure();

    expect(module.get(iface, null)).to.equal(impl);
  });

  it('should instantiate constructor bindings', () => {
    const iface = {};
    class Impl {
      constructor() {
        // noop
      }
    }

    class MockInjector {
      create(impl) {
        return new impl();
      }
    }

    class SubModule extends Module {
      configure() {
        this.bind(iface).to(Impl);
      }
    }

    const module = new SubModule();
    module.configure();

    expect(module.get(iface, new MockInjector())).to.be.an.instanceOf(Impl);
  });
});
