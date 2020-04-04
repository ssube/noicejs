import { expect } from 'chai';

import { ConsoleLogger, Container } from '../../src';
import { MapModule } from '../../src/module/MapModule';

/* eslint-disable sonarjs/no-identical-functions */

const TEST_VALUE = 3;

describe('map module', async () => {
  it('should treat primitives as instances', async () => {
    const module = new MapModule({
      providers: {
        bar: TEST_VALUE,
        foo: '1',
      },
    });

    const container = Container.from(module);
    await container.configure({
      logger: ConsoleLogger.global,
    });

    expect(await container.create('bar')).to.equal(TEST_VALUE);
    expect(await container.create('foo')).to.equal('1');
  });

  it('should treat functions as constructors', async () => {
    class Bar { }
    class Foo { }
    const module = new MapModule({
      providers: {
        bar: Bar,
        foo: Foo,
      },
    });

    const container = Container.from(module);
    await container.configure({
      logger: ConsoleLogger.global,
    });

    expect(await container.create('bar')).to.be.an.instanceOf(Bar);
    expect(await container.create('foo')).to.be.an.instanceOf(Foo);
  });

  it('should accept maps', async () => {
    const module = new MapModule({
      providers: new Map<string, string | number>([
        ['bar', TEST_VALUE],
        ['foo', '1'],
      ]),
    });

    const container = Container.from(module);
    await container.configure({
      logger: ConsoleLogger.global,
    });

    expect(await container.create('bar')).to.equal(TEST_VALUE);
    expect(await container.create('foo')).to.equal('1');

  });

  it('should convert dicts', async () => {
    class Bar {}
    const module = new MapModule({
      providers: {
        bar: Bar,
        foo: '1',
      },
    });

    const container = Container.from(module);
    await container.configure({
      logger: ConsoleLogger.global,
    });

    expect(await container.create('bar')).to.be.an.instanceOf(Bar);
    expect(await container.create('foo')).to.equal('1');
  });

  it('should work without a logger', async () => {
    const module = new MapModule({
      providers: {
        foo: TEST_VALUE,
      },
    });
    const container = Container.from(module);
    await container.configure({});

    expect(await container.create('foo')).to.equal(TEST_VALUE);
  });
});
