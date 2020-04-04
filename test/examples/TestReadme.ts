import { expect } from 'chai';

import { Server } from '.';
import { Container } from '../../src';
import { LocalModule } from './local';

describe('readme example', async () => {
  it('should get items from cache first', async () => {
    const container = Container.from(new LocalModule());
    await container.configure();

    const server = await container.create(Server, {
      ttl: 60,
    });
    const result = await server.get('test');

    expect(result).to.equal('hello world!');
  });
});
