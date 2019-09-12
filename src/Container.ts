import { Dependency } from './Dependency';
import { ContainerBoundError } from './error/ContainerBoundError';
import { ContainerNotBoundError } from './error/ContainerNotBoundError';
import { InvalidProviderError } from './error/InvalidProviderError';
import { LoggerNotFoundError } from './error/LoggerNotFoundError';
import { MissingValueError } from './error/MissingValueError';
import { getInject } from './Inject';
import { Logger } from './logger/Logger';
import { Module, ProviderType } from './Module';
import { isNil } from './utils';
import { VERSION_INFO } from './version';

/* tslint:disable:no-any */

/**
 * Some constructor taking options as the first parameter.
 *
 * @public
 */
export interface Constructor<TReturn, TOptions extends BaseOptions> {
  /* tslint:disable-next-line:callable-types */
  new(options: TOptions, ...extra: Array<unknown>): TReturn;
}

/**
 * The identifier for a contract of some type.
 *
 * @public
 */
export type ContractName = string | symbol;

/**
 * A contract identifier or concrete constructor.
 *
 * @public
 */
export type Contract<TReturn, TOptions extends BaseOptions> = ContractName | Constructor<TReturn, TOptions>;

/**
 * Get the standard name for a contract (usually a constructor).
 *
 * This accepts strings and symbols, so if a function is not provably a constructor, simply pass the name.
 *
 * @public
 */
export function contractName(c: Contract<any, any>): ContractName {
  if (typeof c === 'function') {
    return c.name;
  } else {
    return c;
  }
}

/**
 * Typeguard for constructors. Only really validates that `it` is a function.
 *
 * @public
 */
export function isConstructor(it: any): it is Constructor<any, any> {
  return typeof it === 'function';
}

/**
 * Base interface for all constructor options.
 *
 * @public
 */
export interface BaseOptions {
  container: Container;
}

export interface ContainerOptions {
  logger?: Logger;
}

/**
 * This is an exceptionally minimal DI container.
 *
 * @public
 */
export class Container implements ContainerOptions {
  public static from(...modules: Array<Module>) {
    return new Container(modules);
  }

  public logger?: Logger;
  protected modules: Array<Module>;
  protected ready: boolean;

  constructor(modules: Iterable<Module>) {
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

    if (!isNil(options.logger)) {
      this.logger = options.logger;
    }

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
  public async create<TReturn, TOptions extends BaseOptions>(
    contract: Contract<TReturn, TOptions>,
    options: Partial<TOptions> = {},
    ...args: Array<unknown>
  ): Promise<TReturn> {
    if (!this.ready) {
      throw new ContainerNotBoundError('container has not been configured yet');
    }
    if (isNil(contract)) {
      throw new MissingValueError('missing contract');
    }

    if (this.logger !== undefined) {
      this.logger.debug({ contract }, 'container create contract');
    }

    const module = this.modules.find((item) => {
      return item.has(contract);
    });
    if (isNil(module)) {
      if (isConstructor(contract)) {
        return this.construct(contract, options, args);
      }

      throw new MissingValueError(`container has no provider for contract: ${contractName(contract).toString()}`);
    }

    if (this.logger !== undefined) {
      this.logger.debug({ module }, 'contract provided by module');
    }

    return this.provide(module, contract, options, args);
  }

  public debug() {
    if (this.logger === undefined) {
      throw new LoggerNotFoundError('logger required for container debugging');
    }

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

  public async provide<TReturn, TOptions extends BaseOptions>(
    module: Module,
    contract: Contract<TReturn, TOptions>,
    options: Partial<TOptions>,
    args: Array<unknown>
  ): Promise<TReturn> {
    const provider = module.get<TReturn, TOptions>(contract);
    if (isNil(provider)) {
      this.fail(`module has no provider for contract: ${contractName(contract).toString()}`);
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

  public async construct<TReturn, TOptions extends BaseOptions>(ctor: Constructor<TReturn, TOptions>, options: Partial<TOptions>, args: any) {
    const deps = await this.dependencies(getInject(ctor), options);
    return Reflect.construct(ctor, [deps].concat(args));
  }

  public async apply<TReturn, TOptions extends BaseOptions>(impl: Function, thisArg: Module | undefined, options: Partial<TOptions>, args: any) {
    const deps = await this.dependencies(getInject(impl), options);
    return Reflect.apply(impl, thisArg, [deps].concat(args));
  }

  protected fail(msg: string): never {
    const error = new MissingValueError(msg);

    if (this.logger !== undefined) {
      this.logger.error(error, msg);
    }

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
        const dep = await this.create<any, any>(contract);
        options[name as keyof TOptions] = dep;
      }
    }
    Object.assign(options, passed, {
      container: this,
    });
    return options as TOptions;
  }
}

/**
 * Permanently attach a container to all instances of this class.
 *
 * @public
 */
export function withContainer(container: Container) {
  return <TInner, TOptions extends BaseOptions>(target: Constructor<TInner, TOptions>): Constructor<TInner, TOptions> => {
    class WrappedTarget extends (target as Constructor<any, TOptions>) {
      constructor(options: TOptions, ...others: Array<unknown>) {
        super({
          ...options,
          container,
         }, ...others);
      }
    }
    return WrappedTarget as Constructor<TInner, TOptions>;
  };
}
