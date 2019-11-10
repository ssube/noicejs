import { expect } from 'chai';

import { ConsoleLogger, Container } from '../../src';
import { MapModule } from '../../src/module/MapModule';
import { describeLeaks, itLeaks } from '../helpers/async';

/* eslint-disable sonarjs/no-identical-functions */

describeLeaks('map module', async () => {
  itLeaks('should treat primitives as instances', async () => {
    const module = new MapModule({
      providers: {
        bar: 3,
        foo: '1',
      },
    });

    const container = Container.from(module);
    await container.configure({
      logger: ConsoleLogger.global,
    });

    expect(await container.create('bar')).to.equal(3);
    expect(await container.create('foo')).to.equal('1');
  });

  itLeaks('should treat functions as constructors', async () => {
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

  itLeaks('should accept maps', async () => {
    const module = new MapModule({
      providers: new Map<string, string | number>([
        ['bar', 3],
        ['foo', '1'],
      ]),
    });

    const container = Container.from(module);
    await container.configure({
      logger: ConsoleLogger.global,
    });

    expect(await container.create('bar')).to.equal(3);
    expect(await container.create('foo')).to.equal('1');

  });

  itLeaks('should convert dicts', async () => {
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

  itLeaks('should work without a logger', async () => {
    const module = new MapModule({
      providers: {
        foo: 3,
      },
    });
    const container = Container.from(module);
    await container.configure({});

    expect(await container.create('foo')).to.equal(3);
  });
});
