import { Dependency } from 'src/Dependency';
import { ContainerBoundError } from 'src/error/ContainerBoundError';
import { ContainerNotBoundError } from 'src/error/ContainerNotBoundError';
import { InvalidProviderError } from 'src/error/InvalidProviderError';
import { MissingValueError } from 'src/error/MissingValueError';
import { getInject } from 'src/Inject';
import { Logger } from 'src/logger/Logger';
import { NullLogger } from 'src/logger/NullLogger';
import { Module, ProviderType } from 'src/Module';
import { VERSION_INFO } from './version';

export interface Constructor<TReturn, TOptions> {
  new(options: TOptions, ...extra: Array<any>): TReturn;
}

// the contract for some type can be identified with...
export type ContractName = string | symbol;
export type Contract<R> = ContractName | Constructor<R, any>;

/**
 * Get the standard name for a contract (usually a constructor).
 *
 * This accepts strings and symbols, so if a function is not provably a constructor, simply pass the name.
 */
export function contractName(c: Contract<any>): ContractName {
  if (typeof c === 'function') {
    return c.name;
  } else {
    return c;
  }
}

export function isConstructor(it: any): it is Constructor<any, any> {
  return typeof it === 'function';
}

/**
 * Provider options.
 */
export interface BaseOptions {
  container: Container;
}

export interface ContainerOptions {
  logger?: Logger;
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
    this.logger = NullLogger.global;
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
        logger: this.logger,
      });
    }

    return this;
  }

  /**
   * Returns the best provided value for the request contract.
   */
  public async create<TReturn, TOptions>(contract: Contract<TReturn>, options: Partial<TOptions> = {}, ...args: Array<any>): Promise<TReturn> {
    if (!this.ready) {
      throw new ContainerNotBoundError('container has not been configured yet');
    }
    if (!contract) {
      throw new MissingValueError('missing contract');
    }

    this.logger.debug({ contract }, 'container create contract');

    const module = this.modules.find((item) => {
      return item.has(contract);
    });
    if (!module) {
      if (isConstructor(contract)) {
        return this.construct(contract, options, args);
      }

      throw new MissingValueError(`no provider for contract: ${contractName(contract).toString()}`);
    }

    this.logger.debug({ module }, 'contract provided by module');

    return this.provide(module, contract, options, args);
  }

  public debug() {
    this.logger.debug({ version: VERSION_INFO }, 'container debug');
    for (const m of this.modules) {
      m.debug();
    }
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
      this.fail(`no known provider for contract: ${contractName(contract).toString()}`);
    }

    switch (provider.type) {
      case ProviderType.Constructor:
        return this.construct(provider.value, options, args);
      case ProviderType.Factory:
        return this.apply(provider.value, module, options, args);
      case ProviderType.Instance:
        return provider.value;
      default:
        throw new InvalidProviderError('invalid provider type');
    }
  }

  protected async construct<TReturn, TOptions extends BaseOptions>(ctor: Constructor<TReturn, TOptions>, options: Partial<TOptions>, args: any) {
    const deps = await this.dependencies(getInject(ctor), options);
    return Reflect.construct(ctor, [deps].concat(args));
  }

  protected async apply<TReturn, TOptions extends BaseOptions>(impl: Function, thisArg: Module | undefined, options: Partial<TOptions>, args: any) {
    const deps = await this.dependencies(getInject(impl), options);
    return Reflect.apply(impl, thisArg, [deps].concat(args));
  }

  protected fail(msg: string): never {
    const error = new MissingValueError(msg);
    this.logger.error(error, msg);
    throw error;

  }

  /**
   * Prepare a map with the dependencies for a descriptor.
   *
   * This will always inject the container itself to configure children.
   */
  protected async dependencies<TOptions extends BaseOptions>(deps: Array<Dependency>, passed: Partial<TOptions>): Promise<TOptions> {
    const options: Partial<TOptions> = {};
    for (const dependency of deps) {
      const { contract, name } = dependency;
      if (!Reflect.has(passed, name)) {
        const dep = await this.create(contract);
        options[name as keyof TOptions] = dep;
      }
    }
    Object.assign(options, passed, {
      container: this,
    });
    return options as TOptions;
  }
}
