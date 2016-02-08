
import {expect} from 'chai';
import {Inject} from '../main/inject';

describe('Inject decorator', () => {
  it('should return a function', () => {
    expect(Inject()).to.be.a('function');
  });

  it('should attach params to the target', () => {
    const params = ['a', 'b', 'c'], target = {};
    Inject(...params)(target);
    expect(target.dependencies).to.deep.equal(params);
  });

  it('should work as a class decorator', () => {
    const params = ['a', 'b', 'c'];

    @Inject(...params)
    class Target {
      method() { /* noop */ }
    }

    expect(Target.dependencies).to.deep.equal(params);
  });
});
