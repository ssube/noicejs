import { BaseOptions, Container, Inject } from '../../src';

export type CacheFallback = (path: string) => Promise<string>;

/**
 * Abstract base for a cache.
 *
 * Both of these abstract base classes could be interfaces, but
 * interfaces are types rather than values, and cannot be used
 * in calls to bind.
 */
export class Cache {
  public get(path: string, ttl: number, fallback: CacheFallback): Promise<string> {
    throw new Error('not implemented');
  }
}

export class Filesystem {
  public get(path: string): Promise<string> {
    throw new Error('not implemented');
  }
}

export interface ServerOptions extends BaseOptions {
  cache: Cache;
  filesystem: Filesystem;
  ttl: number;
}

@Inject(Cache.name.toLowerCase(), Filesystem.name.toLowerCase())
export class Server implements ServerOptions {
  public readonly cache: Cache;
  public readonly container: Container;
  public readonly filesystem: Filesystem;
  public readonly ttl: number;

  /**
   * Having the class implement the same options used by the constructor
   * provides a free copy constructor.
   */
  constructor(options: ServerOptions) {
    this.cache = options.cache;
    this.container = options.container;
    this.filesystem = options.filesystem;
    this.ttl = options.ttl;
  }

  public get(path: string) {
    return this.cache.get(path, this.ttl, () => this.filesystem.get(path));
  }
}
