import { Container } from 'noicejs';

class Foo { }

async function main() {
  const container = Container.from();
  await container.configure();

  const foo = await container.create(Foo);
  console.log(foo instanceof Foo);
  // prints: true
}
