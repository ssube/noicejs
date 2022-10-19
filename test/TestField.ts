import { expect } from 'chai';

import { Field, fillFields, getFields } from '../src/Field.js';

/* eslint-disable @typescript-eslint/unbound-method */
describe('field decorator', async () => {
  it('should work as a field decorator', async () => {
    const numberSymbol = Symbol('number');

    interface TargetProps {
      [numberSymbol]: number;
    }

    class Target {
      @Field(numberSymbol)
      public foo: number;

      constructor(props: TargetProps) {
        this.foo = 0;

        fillFields(this, props as any);
      }

      /* c8 ignore next */
      private method() { /* noop */ }
    }

    const target = new Target({
      [numberSymbol]: 4, // random
    });

    expect(getFields(target).length).to.equal(1);
    expect(target.foo).to.equal(4);
  });
});
