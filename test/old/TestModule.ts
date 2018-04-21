import {expect} from 'chai';
import {Module} from 'src/Module';

class TestModule extends Module {
  public async configure() {
    /* noop */
  }
}

describe('Module class', () => {
  it('should start with no bindings', () => {
    expect(new TestModule().size).to.equal(0);
  });

  it('should bind an interface and return a builder', () => {
    const iface = Symbol();
    const builder = new TestModule().bind(iface);
    for (const [key, value] of Object.entries(builder)) {
      expect(value).to.be.a('function');
    }
  });

  it('should bind an interface to an deferred implementation', () => {
    const iface = Symbol();
    const impl = {};
    const module = new TestModule();

    module.bind(iface).toInstance(impl);
    expect(module.get(iface).value).to.equal(impl);
  });

  it('should bind an interface to an implementation immediately', () => {
    const iface = Symbol();
    const impl = {};
    const module = new TestModule();

    module.bind(iface).toInstance(impl);
    expect(module.get(iface).value).to.equal(impl);
  });
});
