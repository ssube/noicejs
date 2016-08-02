import {expect} from 'chai';
import {Options, WrapInject} from '../main/inject';
import {TestInjector} from './HelperClass';

describe('WrapInject decorator', () => {
  it('should return a function', () => {
    expect(WrapInject()).to.be.a('function');
  });

  it('should attach params to the target', () => {
    const params = [{name: 'a'}, {name: 'b'}, {name: 'c'}];

    class Target {
      method() { /* noop */ }
    }

    const wrapper = WrapInject(...params)(Target);

    expect(Options.getOptions(wrapper).deps).to.deep.equal(params);
    expect(wrapper).not.to.equal(Target);
    expect(new wrapper({
      injector: new TestInjector()
    })).to.be.an.instanceof(Target);
  });

  it('should work as a class decorator', () => {
    const params = [{name: 'a'}, {name: 'b'}, {name: 'c'}];

    @WrapInject(...params)
    class Target {
      method() { /* noop */ }
    }

    expect(Options.getOptions(Target).deps).to.deep.equal(params);
    expect(new Target({
      injector: new TestInjector()
    })).to.be.an.instanceof(Target.wrappedClass);
  });

  it('should work as a method decorator', () => {
    const params = [{name: 'a'}, {name: 'b'}, {name: 'c'}];
    let counter = 0;
    class Target {
      @WrapInject(...params)
      method() {
        ++counter;
      }
    }

    const inst = new Target();
    inst.method({
      injector: new TestInjector()
    });

    expect(inst.method).to.be.an.instanceof(Function);
    expect(Options.getOptions(Target.prototype.method).deps).to.deep.equal(params);
    expect(counter).to.equal(1);
  });
});
