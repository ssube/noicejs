import {expect} from 'chai';
import {WrapInject} from '../main/inject';

describe('WrapInject decorator', () => {
  it('should return a function', () => {
    expect(WrapInject()).to.be.a('function');
  });

  xit('should attach params to the target', () => {
    const params = ['a', 'b', 'c'];

    class Target {
      method() { /* noop */ }
    }

    const wrapper = WrapInject(...params)(Target);

    expect(wrapper.dependencies).to.deep.equal(params);
    expect(wrapper).not.to.equal(Target);
    expect(new wrapper({
      injector: {
        getDependencies: () => []
      }
    })).to.be.an.instanceof(Target);
  });

  xit('should work as a class decorator', () => {
    const params = ['a', 'b', 'c'];

    @WrapInject(...params)
    class Target {
      method() { /* noop */ }
    }

    expect(Target.dependencies).to.deep.equal(params);
    expect(new Target({
      injector: {
        getDependencies: () => []
      }
    })).to.be.an.instanceof(Target.wrappedClass);
  });

  it('should not work as a method decorator', () => {
    const params = ['a', 'b', 'c'];


    expect(() => {
      class Target {
        @WrapInject(...params)
        method() { /* noop */ }
      }
    }).to.throw();
  });
});
