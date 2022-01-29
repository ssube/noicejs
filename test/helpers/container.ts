import { Container } from '../../src/Container.js';

export async function createContainer(): Promise<{container: Container}> {
  const container = Container.from();
  await container.configure();
  return {container};
}
