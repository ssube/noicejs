import { Cache, CacheFallback, Filesystem } from '../index.js';
import { Module } from '../../../src/index.js';

export class LocalCache extends Cache {
  public async get(path: string, ttl: number, fallback: CacheFallback): Promise<string> {
    return 'hello world!';
  }
}

export class LocalFilesystem extends Filesystem {
  public async get(path: string): Promise<string> {
    throw new Error('file not found!');
  }
}

export class LocalModule extends Module {
  public async configure() {
    this.bind(Cache.name.toLowerCase()).toConstructor(LocalCache);
    this.bind(Filesystem.name.toLowerCase()).toConstructor(LocalFilesystem);
  }
}
