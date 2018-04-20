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

  it('should bind an interface and return a to function', () => {
    const iface = Symbol(), keys = ['to'];
    expect(Object.keys(new TestModule().bind(iface))).to.deep.equal(keys);
  });

  it('should bind an interface to an deferred implementation', () => {
    const iface = Symbol(), impl = {}, module = new TestModule();
    module.bind(iface).toInstance(impl);
    expect(module.get(iface)).to.equal(impl);
  });

  it('should bind an interface to an implementation immediately', () => {
    const iface = Symbol(), impl = {}, module = new TestModule();
    module.bind(iface).toInstance(impl);
    expect(module.get(iface)).to.equal(impl);
  });

  it('should throw on configure', () => {
    expect(() => {
      new TestModule().configure();
    }).to.throw();
  });
});