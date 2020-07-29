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

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Extra arguments of unknown types.
 *
 * @public
 */
export type ExtraArgs = ReadonlyArray<any>;

/**
 * Some constructor taking options as the first parameter.
 *
 * @public
 */
export interface Constructor<TReturn, TOptions extends BaseOptions> {
  /* eslint-disable-next-line @typescript-eslint/prefer-function-type */
  new(options: TOptions, ...extra: ExtraArgs): TReturn;
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

export type AnyContract = Contract<any, AnyOptions>;

/**
 * Options after being wrapped with a permanent container.
 *
 * @public
 */
export type WrappedOptions<T extends BaseOptions> = Omit<T, 'container'>;

/**
 * A partial set of wrapped options.
 *
 * @public
 */
export type PartialOptions<T extends BaseOptions> = Partial<WrappedOptions<T>>;

export type AnyOptions = any;

/**
 * Get the standard name for a contract (usually a constructor).
 *
 * This accepts strings and symbols, so if a function is not provably a constructor, simply pass the name.
 *
 * @public
 */
export function contractName(c: Contract<unknown, AnyOptions>): ContractName {
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
export function isConstructor(it: unknown): it is Constructor<unknown, AnyOptions> {
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

    this.logger = options.logger;
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
    options: PartialOptions<TOptions> = {},
    ...args: ExtraArgs
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

    const module = this.modules.find((item) => item.has(contract));
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
    if (isNil(this.logger)) {
      throw new LoggerNotFoundError('container has no logger');
    }

    this.logger.debug({ version: VERSION_INFO }, 'container debug');
    for (const m of this.modules) {
      m.debug();
    }
  }

  public getModules(): ReadonlyArray<Module> {
    return this.modules;
  }

  /**
   * Create a child container with additional modules.
   */
  public with(...modules: ReadonlyArray<Module>): Container {
    const merged = this.modules.concat(modules);
    return new Container(merged);
  }

  public async provide<TReturn, TOptions extends BaseOptions>(
    module: Module,
    contract: Contract<TReturn, TOptions>,
    options: PartialOptions<TOptions>,
    args: ExtraArgs
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

  public async construct<TReturn, TOptions extends BaseOptions>(
    ctor: Constructor<TReturn, TOptions>,
    options: PartialOptions<TOptions>,
    args: ExtraArgs
  ) {
    const deps: ExtraArgs = [await this.dependencies(getInject(ctor), options)];
    return Reflect.construct(ctor, deps.concat(args));
  }

  public async apply<TReturn, TOptions extends BaseOptions>(
    // eslint-disable-next-line @typescript-eslint/ban-types
    impl: Function,
    thisArg: unknown,
    options: PartialOptions<TOptions>,
    args: ExtraArgs
  ): Promise<TReturn> {
    const deps: ExtraArgs = [await this.dependencies(getInject(impl), options)];
    return Reflect.apply(impl, thisArg, deps.concat(args)) as TReturn;
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
  protected async dependencies<TOptions extends BaseOptions>(deps: Array<Dependency>, passed: PartialOptions<TOptions>): Promise<TOptions> {
    const options: Partial<TOptions> = {};
    for (const dependency of deps) {
      const { contract, name } = dependency;
      if (!Reflect.has(passed, name)) {
        // tslint:disable-next-line:no-any
        const dep = await this.create<any, AnyOptions>(contract);
        options[name as keyof TOptions] = dep;
      }
    }
    Object.assign(options, passed, {
      container: this,
    });
    return options as TOptions;
  }
}

export interface WrappedConstructor<TInner, TOptions extends BaseOptions> extends Constructor<TInner, TOptions> {
  new(options: WrappedOptions<TOptions>): TInner;
}

/**
 * Permanently attach a container to all instances of this class.
 *
 * @public
 */
export function constructWithContainer(container: Container) {
  return <TInner, TOptions extends BaseOptions>(target: Constructor<TInner, TOptions>): WrappedConstructor<TInner, TOptions> => {
    // TODO: this shouldn't need any, but TInner is not sufficiently provable and causes a TS error
    class WrappedTarget extends (target as Constructor<any, TOptions>) {
      constructor(options: TOptions, ...others: ExtraArgs) {
        /* eslint-disable-next-line constructor-super */
        super({
          ...options,
          container,
        }, ...others);
      }
    }
    return WrappedTarget as WrappedConstructor<TInner, TOptions>;
  };
}

/**
 * The required signature for a function to be invoked by the wrapper.
 *
 * @public
 * @todo does these options need to extend BaseOptions?
 */
export type InvokableFunction<TOptions, TReturn> = (options: TOptions, ...others: ExtraArgs) => TReturn;
export type WrappedFunction<TOptions extends BaseOptions, TReturn> = InvokableFunction<WrappedOptions<TOptions>, TReturn>;

/**
 * Permanently attach a container to all invocations of this function.
 *
 * @public
 */
export function invokeWithContainer<TReturn, TOptions extends BaseOptions>(
  container: Container,
  target: InvokableFunction<TOptions, TReturn>
): InvokableFunction<WrappedOptions<TOptions>, TReturn> {
  /**
   * @this unknown
   */
  return function wrapper(this: unknown, options: WrappedOptions<TOptions>, ...others: ExtraArgs): TReturn {
    const completeOptions: BaseOptions = {
      ...options,
      container,
    };
    return target.apply(this, [completeOptions as TOptions, ...others]);
  };
}
