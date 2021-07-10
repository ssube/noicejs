import { expect } from 'chai';

import { BaseOptions, constructWithContainer, Container, invokeWithContainer } from '../../src/Container';

/* eslint-disable arrow-body-style, @typescript-eslint/no-explicit-any */

interface SubOptions extends BaseOptions {
  other: string;
}

const TEST_STRING = 'test';

describe('container decorators', async () => {
  describe('construct with', async () => {
    it('should attach a container', async () => {
      const ctr = Container.from();
      await ctr.configure();

      @constructWithContainer(ctr)
      class TestClass {
        public readonly container: Container;

        constructor(options: BaseOptions) {
          this.container = options.container;
        }
      }

      const instance = new TestClass({} as any);
      expect(instance.container).to.equal(ctr);
    });

    it('should pass on any other options', async () => {
      const ctr = Container.from();
      await ctr.configure();

      @constructWithContainer(ctr)
      class TestClass {
        public readonly container: Container;
        public readonly other: string;

        constructor(options: SubOptions) {
          this.container = options.container;
          this.other = options.other;
        }
      }

      const instance = new TestClass({
        other: TEST_STRING,
      } as any);
      expect(instance.other).to.equal(TEST_STRING);
    });

    it('should pass on any other arguments', async () => {
      const ctr = Container.from();
      await ctr.configure();

      @constructWithContainer(ctr)
      class TestClass {
        public readonly container: Container;
        public readonly param1: any;
        public readonly param2: any;

        constructor(options: BaseOptions, param1: any, param2: any) {
          this.container = options.container;
          this.param1 = param1;
          this.param2 = param2;
        }
      }

      const arg1 = {};
      const arg2 = {};
      const instance = new TestClass({} as any, arg1, arg2);
      expect(instance.param1).to.equal(arg1);
      expect(instance.param2).to.equal(arg2);
    });
  });

  describe('invoke with', async () => {
    it('should attach a container', async () => {
      const ctr = Container.from();
      await ctr.configure();

      const fn = invokeWithContainer(ctr, (options: BaseOptions) => {
        return options.container;
      });

      expect(fn({})).to.equal(ctr);
    });

    it('should pass on any other options', async () => {
      const ctr = Container.from();
      await ctr.configure();

      const fn = invokeWithContainer(ctr, (options: SubOptions) => {
        return options.other;
      });

      expect(fn({
        other: TEST_STRING,
      })).to.equal(TEST_STRING);
    });

    it('should pass on any other arguments', async () => {
      const ctr = Container.from();
      await ctr.configure();

      const fn = invokeWithContainer(ctr, (_options: Partial<BaseOptions>, param1: any, param2: any) => {
        return [param1, param2];
      });

      const arg1 = {};
      const arg2 = {};
      expect(fn({}, arg1, arg2)).to.deep.equal([arg1, arg2]);
    });
  });
});
