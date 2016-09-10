import {expect} from 'chai';
import {Module, Provides} from '../main/inject';

describe('Module class', () => {
  it('should start with no bindings', () => {
    expect(new Module().bindings.size).to.equal(0);
  });

  it('should bind an interface and return a to function', () => {
    const iface = {}, keys = ['to'];
    expect(Object.keys(new Module().bind(iface))).to.deep.equal(keys);
  });

  it('should bind an interface to an deferred implementation', () => {
    const iface = {}, impl = {}, module = new Module();
    module.bind(iface).to(impl);
    expect(module.bindings.get(iface)).to.equal(impl);
  });

  it('should bind an interface to an implementation immediately', () => {
    const iface = {}, impl = {}, module = new Module();
    module.bind(iface, impl);
    expect(module.bindings.get(iface)).to.equal(impl);
  });

  it('should throw on configure', () => {
    expect(() => {
      new Module().configure();
    }).to.throw();
  });
});
