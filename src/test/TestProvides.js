import {expect} from 'chai';
import {Provides} from '../main/inject';

describe('Provides decorator', () => {
  it('should return a function', () => {
    expect(Provides()).to.be.a('function');
  });

  it('should register the method on the class', () => {
    const iface = {}, target = {constructor: {}, foo: {}};
    Provides(iface)(target, 'foo');
    expect(target.constructor._providers.get(iface)).to.equal(target.foo);
  });

  it('should work as a method decorator', () => {
    const iface = {};

    class Target {
      @Provides(iface)
      foo() { /* noop */ }
    }

    expect(Target._providers.get(iface)).to.equal(Target.prototype.foo);
  });
});
