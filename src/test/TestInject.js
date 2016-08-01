import {expect} from 'chai';
import {Inject, Options} from '../main/inject';

describe('Inject decorator', () => {
  it('should return a function', () => {
    expect(Inject()).to.be.a('function');
  });

  it('should work as a class decorator', () => {
    const params = [{name: 'a'}, {name: 'b'}, {name: 'c'}];

    @Inject(...params)
    class Target {
      method() { /* noop */ }
    }

    expect(Options.getOptions(Target).deps).to.deep.equal(params);
  });
});
