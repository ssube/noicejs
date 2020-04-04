import { expect } from 'chai';

import { Server } from '.';
import { Container } from '../../src';
import { LocalCache, LocalFilesystem, LocalModule } from './local';

const TEST_TTL = 60;

function module() {
  return new LocalModule();
}

describe('readme example', async () => {
  it('should get items from cache first', async () => {
    const container = Container.from(module());
    await container.configure();

    const server = await container.create(Server, {
      ttl: TEST_TTL,
    });
    const result = await server.get('test');

    expect(result).to.equal('hello world!');

    /* these are guaranteed by the library, but for the sake of example: */
    expect(server.cache).to.be.an.instanceOf(LocalCache);
    expect(server.filesystem).to.be.an.instanceOf(LocalFilesystem);
    expect(server.ttl).to.equal(TEST_TTL);
  });
});
