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
    }

    const target = new Target({
      [numberSymbol]: 4, // random
    });

    expect(getFields(target).length).to.equal(1);
    expect(target.foo).to.equal(4);
  });

  it('should work on multiple fields', async () => {
    const numberSymbol = Symbol('number');
    const stringSymbol = Symbol('string');

    interface TargetProps {
      [numberSymbol]: number;
      [stringSymbol]: string;
    }

    class Target {
      @Field(numberSymbol)
      public foo: number;

      @Field(stringSymbol)
      public bar: string;

      constructor(props: TargetProps) {
        this.foo = 0;
        this.bar = '';

        fillFields(this, props);
      }
    }

    const target = new Target({
      [numberSymbol]: 4,
      [stringSymbol]: 'bar',
    });

    expect(getFields(target).length).to.equal(2);
    expect(target.bar).to.equal('bar');
  });

  it('should handle duplicate fields', async () => {
    const numberSymbol = Symbol('number');

    interface TargetProps {
      [numberSymbol]: number;
    }

    class Target {
      @Field(numberSymbol)
      public bar: number;

      @Field(numberSymbol)
      public foo: number;

      constructor(props: TargetProps) {
        this.bar = 0;
        this.foo = 0;

        fillFields(this, props);
      }
    }

    const target = new Target({
      [numberSymbol]: 4,
    });

    expect(target.bar).to.equal(4);
    expect(target.foo).to.equal(4);
  });

  it('should handle duplicate decorators', async () => {
    const numberSymbol = Symbol('number');
    const stringSymbol = Symbol('string');

    interface TargetProps {
      [numberSymbol]: number;
    }

    class Target {
      @Field(numberSymbol)
      @Field(stringSymbol)
      public bar: number;

      constructor(props: TargetProps) {
        this.bar = 0;

        fillFields(this, props);
      }
    }

    const target = new Target({
      [numberSymbol]: 4,
    });

    expect(target.bar).to.equal(4);
  });

  it('should not work on classes', async () => {
    const numberSymbol = Symbol('number');

    expect(() => {
      @Field(numberSymbol)
      class Target {
        // empty
      }
    }).to.throw('field decorator must be used on a field');
  });

  it('should handle missing values', async () => {
    const numberSymbol = Symbol('number');

    interface TargetProps {
      [numberSymbol]: number;
    }

    class Target {
      @Field(numberSymbol)
      public bar: number;

      constructor(props: Partial<TargetProps>) {
        this.bar = 0;

        fillFields(this, props);
      }
    }

    expect(() => new Target({})).to.throw('missing value for field');
  });
});
