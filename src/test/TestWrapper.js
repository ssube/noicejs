import {expect} from 'chai';
import {Injector, Wrapper} from '../main/inject';
import {TestInjector} from './HelperClass';

describe('Wrapper class', () => {
  it('should wrap a class', () => {
    class Target {
      constructor(...args) {
        this._args = args;
      }
    }

    const args = [new TestInjector(), 1, 2, 3];
    const wrapped = Wrapper.wrapClass(Target);
    const inst = new wrapped(...args);

    expect(wrapped).to.not.equal(Target);
    expect(inst).to.be.an.instanceof(Target);
    expect(inst._args).to.deep.equal(args);
  });

  it('should wrap a method', () => {
    class Target {
      method(...args) {
        this._args = args;
      }
    }

    const proto = Target.prototype;
    Wrapper.wrapMethod(proto.method, Object.getOwnPropertyDescriptor(proto, 'method'));

    const args = [new TestInjector(), 1, 2, 3];
    const inst = new Target();
    inst.method(...args);

    expect(inst._args).to.deep.equal(args);
  });
});
