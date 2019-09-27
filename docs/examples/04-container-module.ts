import { Container } from 'noicejs';
import { NetworkModule, NetworkThing } from './03-module';

async function main() {
  const container = Container.from(new NetworkModule());
  await container.configure();

  const foo = await container.create('foo');
  console.log(foo instanceOf NetworkThing);
}
