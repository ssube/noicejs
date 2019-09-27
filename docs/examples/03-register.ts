import { Container, MapModule } from 'noicejs';

@Inject('foo')
class Bar {
  constructor(options) {
    console.log(options.foo);
  }
}

async function main() {
  const container = Container.from(new MapModule({
    providers: {
      foo: 3,
    },
  }));
  await container.configure();

  const bar = await container.create(Bar);
  // prints: 3
}
