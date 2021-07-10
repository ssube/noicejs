import { BaseOptions, Container, Inject } from '../../src';

export type CacheFallback = (path: string) => Promise<string>;

/**
 * Base class for a cache.
 *
 * Both of these base classes could be abstract or interfaces, but
 * interfaces are types rather than values, and neither can be used
 * in calls to bind or inject.
 */
export class Cache {
  public get(_path: string, _ttl: number, _fallback: CacheFallback): Promise<string> {
    throw new Error('not implemented');
  }
}

export class Filesystem {
  public get(_path: string): Promise<string> {
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

  public get(path: string): Promise<string> {
    return this.cache.get(path, this.ttl, () => this.filesystem.get(path));
  }
}
