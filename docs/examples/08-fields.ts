import { Container, Field, injectFields, InjectWithFields, Module } from 'noicejs';

class RandomModule extends Module {
  public async configure(options) {
    await super.configure(options);

    this.bind('foo').toFactory(() => Math.random());
    this.bind('bar').toInstance(3);
  }
}

@InjectWithFields()
class FooBar {
  @Field('foo')
  public foo: number;

  @Field('bar')
  public bar: number;

  constructor(options) {
    injectFields(this, options);
  }
}

async function main() {
  const container = Container.from(new RandomModule());
  await container.configure();

  const foobar = await container.create(FooBar);

  console.log(foobar.foo, foobar.bar);
  // prints: N, 3
}
