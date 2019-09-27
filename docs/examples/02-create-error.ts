import { Container } from 'noicejs';

async function main() {
  const container = Container.from();
  await container.configure();

  @Inject('foo')
  class Bar { }

  try {
    const bar = await container.create(Bar);
  } catch (err) {
    console.error(err);
    // prints: TODO
  }
}
