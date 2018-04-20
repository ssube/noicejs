import {BaseOptions, Container} from 'src/Container';

export async function createContainer(): Promise<{container: Container}> {
  const container = Container.from();
  await container.configure();
  return {container};
}
