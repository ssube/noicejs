import { Container, Inject } from 'noicejs';
import { NetworkModule, NetworkThing } from './03-module';

@Inject('foo')
class Bar {
  constructor(options) {
    console.log(options.container, options.foo);
  }
}

async function main() {
  const container = Container.from(new NetworkModule());
  await container.configure();

  const bar = await container.create(Bar);
  // prints: Container {}, NetworkThing {}
}
