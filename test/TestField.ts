import { expect } from 'chai';

import { BaseOptions, Container } from '../src/Container.js';
import { Field, getFields, injectFields } from '../src/Field.js';
import { ConsoleLogger } from '../src/index.js';
import { InjectWithFields } from '../src/Inject.js';
import { MapModule } from '../src/module/MapModule.js';

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

        injectFields(this, props);
      }
    }

    const target = new Target({
      [numberSymbol]: 4, // random
    });

    expect(getFields(Target).length).to.equal(1);
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

        injectFields(this, props);
      }
    }

    const target = new Target({
      [numberSymbol]: 4,
      [stringSymbol]: 'bar',
    });

    expect(getFields(Target).length).to.equal(2);
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

        injectFields(this, props);
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

        injectFields(this, props);
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

  it('should handle objects with no prototype', async () => {
    const target = Object.create(null, {});
    injectFields(target, {});

    expect(target).to.deep.equal({});
  });

  it('should handle missing values', async () => {
    const numberSymbol = Symbol('number');

    interface TargetProps extends BaseOptions {
      [numberSymbol]: number;
    }

    @InjectWithFields()
    class Target {
      @Field(numberSymbol)
      public bar: number;

      constructor(props: Partial<TargetProps>) {
        this.bar = 0;

        injectFields(this, props);
      }
    }

    const fields = getFields(Target);
    expect(fields.length).to.be.greaterThan(0);

    const container = Container.from(new MapModule({
      providers: new Map([
        [numberSymbol, 4],
      ]),
    }));
    await container.configure();

    const target = await container.create(Target);

    expect(target.bar).to.equal(4);
  });
});
