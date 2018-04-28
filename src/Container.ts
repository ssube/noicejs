import { isFunction, kebabCase } from 'lodash';

import { ContainerBoundError } from 'src/error/ContainerBoundError';
import { ContainerNotBoundError } from 'src/error/ContainerNotBoundError';
import { MissingValueError } from 'src/error/MissingValueError';

import { Dependency, Descriptor } from 'src/Dependency';
import { getDepends } from 'src/Inject';
import { Logger } from 'src/logger/Logger';
import { NullLogger } from 'src/logger/NullLogger';
import { Factory, Module, Provider, ProviderType } from 'src/Module';

export interface Constructor<TReturn, TOptions> {
  new(options: TOptions, ...extra: Array<any>): TReturn;
}

// the contract for some type can be identified with...
export type Contract<R> = string | symbol | Constructor<R, any>;

/**
 * Get the standard name for a contract (usually a constructor).
 *
 * This accepts strings and symbols, so if a function is not provably a constructor, simply pass the name.
 *
 * @warning This can do unfortunate things to mixed alpha-numeric strings, so strings without capital letters will
 */
export function contractName(c: Contract<any>): string {
  if (isFunction(c)) {
    return kebabCase(c.name);
  } else if (/[A-Z]/.test(c.toString())) {
    return kebabCase(c.toString());
  } else {
    return c.toString();
  }
}

export function isConstructor(it: any): it is Constructor<any, any> {
  return isFunction(it);
}

/**
 * Provider options.
 */
export interface BaseOptions {
  container: Container;
}

export interface ContainerOptions {
  logger: Logger | undefined;
}

/**
 * This is an exceptionally minimal DI container.
 */
export class Container {
  public static from(...modules: Array<Module>) {
    return new Container(modules);
  }

  protected logger: Logger;
  protected modules: Array<Module>;
  protected ready: boolean;

  constructor(modules: Iterable<Module>) {
    this.logger = new NullLogger();
    this.modules = Array.from(modules);
    this.ready = false;
  }

  /**
   * Configure each module, linking dependencies to their contracts and preparing factories.
   *
   * This must be done sequentially, since some modules may use classes from other modules.
   */
  public async configure(options: ContainerOptions = { logger: undefined }) {
    if (this.ready) {
      throw new ContainerBoundError('container already bound');
    }

    this.logger = options.logger || this.logger;
    this.ready = true;

    for (const module of this.modules) {
      await module.configure({
        container: this,
        logger: this.logger
      });
    }

    return this;
  }

  /**
   * Returns the best provided value for the request contract.
   */
  public async create<TReturn, TOptions extends BaseOptions>(contract: Contract<TReturn>, options: Partial<TOptions> = {}, ...args: Array<any>): Promise<TReturn> {
    if (!this.ready) {
      throw new ContainerNotBoundError('container has not been configured yet');
    }
    if (!contract) {
      throw new MissingValueError('missing contract');
    }

    this.logger.debug({ contract }, 'container create contract');

    const module = this.provides(contract);
    if (!module) {
      if (isFunction(contract)) {
        // @todo this shouldn't need a cast but detecting constructors is difficult
        return this.construct<TReturn, TOptions>(contract as Constructor<TReturn, TOptions>, options, args);
      }

      throw new MissingValueError(`no provider for contract: ${contractName(contract)}`);
    }

    this.logger.debug({ module }, 'contract provided by module');

    return this.provide(module, contract, options, args);
  }

  public getModules(): Array<Module> {
    return this.modules;
  }

  /**
   * Create a child container with additional modules.
   */
  public with(...modules: Array<Module>): Container {
    const merged = this.modules.concat(modules);
    return new Container(merged);
  }

  protected async provide<TReturn, TOptions extends BaseOptions>(module: Module, contract: Contract<TReturn>, options: Partial<TOptions>, args: Array<any>): Promise<TReturn> {
    const provider = module.get<TReturn>(contract);
    if (!provider) {
      this.fail(`no known provider for contract: ${contractName(contract)}`);
    }

    switch (provider.type) {
      case ProviderType.Constructor:
        return this.construct<TReturn, TOptions>(provider.value, options, args);
      case ProviderType.Factory:
        return this.invoke<TReturn, TOptions>(provider.value, module, options, args);
      case ProviderType.Instance:
        return provider.value;
      default:
        throw new Error('invalid provider type');
    }
  }

  protected fail(msg: string): never {
    const error = new MissingValueError(msg);
    this.logger.error(error, msg);
    throw error;

  }

  protected async construct<R, O extends BaseOptions>(ctor: Constructor<R, O>, options: Partial<O>, args: Array<any>): Promise<R> {
    const deps = await this.dependencies<O>(getDepends(ctor));
    Object.assign(deps, options);
    return Reflect.construct(ctor, [deps].concat(args));
  }

  protected async invoke<R, O extends BaseOptions>(factory: Factory<R>, thisArg: Module, options: Partial<O>, args: Array<any>): Promise<R> {
    const deps = await this.dependencies<O>(getDepends(factory));
    Object.assign(deps, options);
    return Reflect.apply(factory, thisArg, [deps].concat(args));
  }

  /**
   * Prepare a map with the dependencies for a descriptor.
   *
   * This will always inject the container itself to configure children.
   *
   * @todo resolve dependencies in parallel
   */
  protected async dependencies<O extends BaseOptions>(deps: Array<Dependency>): Promise<O> {
    const options: Partial<O> = {};
    for (const dependency of deps) {
      const { contract, name } = dependency;
      const dep = await this.create(contract);
      options[name as keyof O] = dep;
    }
    Object.assign(options, {
      container: this
    });
    return options as O;
  }

  protected provides<R>(contract: Contract<R>): Module | undefined {
    return this.modules.find((item) => {
      return item.has(contract);
    });
  }
}
