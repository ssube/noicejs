import { Container } from 'noicejs';

async function main() {
  const container = Container.from();
  await container.configure();
}
