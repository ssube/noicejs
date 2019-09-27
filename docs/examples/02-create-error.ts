import { Container } from 'noicejs';

@Inject('foo')
class Bar { }

async function main() {
  const container = Container.from();
  await container.configure();

  try {
    const bar = await container.create(Bar);
  } catch (err) {
    console.error(err);
    // prints: TODO
  }
}
