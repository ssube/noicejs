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
});
