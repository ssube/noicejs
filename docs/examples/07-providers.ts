import { Container, Inject, Module } from 'noicejs';

class RandomModule extends Module {
  public async configure(options) {
    await super.configure(options);

    this.bind('foo').toFactory(() => Math.random());
    this.bind('bar').toInstance(3);
  }
}

@Inject('foo', 'bar')
class FooBar {
  constructor(options) {
    console.log(options.foo, options.bar);
  }
}

async function main() {
  const container = Container.from(new RandomModule());
  await container.configure();

  const foobar = await container.create(FooBar);
  // prints: N, 3
}
