import { Container } from 'noicejs';

async function main() {
  const container = Container.from();
  await container.configure();

  class Foo { }
  const foo = await container.create(Foo);

  console.log(foo instanceof Foo);
  // prints: true
}
