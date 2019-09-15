import { BaseOptions, Constructor, Container, Contract, contractName } from './Container';
import { LoggerNotFoundError } from './error/LoggerNotFoundError';
import { Logger } from './logger/Logger';
import { NullLogger } from './logger/NullLogger';
import { getProvides } from './Provides';
import { doesExist, isNil } from './utils';

/* tslint:disable:no-any */

/**
 * Providers for a particular contract.
 *
 * @public
 */
export enum ProviderType {
  None = 0,
  Constructor,
  Factory,
  Instance,
}

/**
 * Factory provider signature.
 *
 * @public
 */
export type Factory<R> = (options: any) => Promise<R>;

/**
 * Concrete implementation provider signature group.
 *
 * @public
 */
export type Implementation<T> = Constructor<T, any> | Factory<T>;

/**
 * Provider definitions.
 *
 * @public
 */
export type Provider<R> = {
  type: ProviderType.Constructor;
  value: Constructor<R, any>;
} | {
  type: ProviderType.Factory;
  value: Factory<R>
} | {
  type: ProviderType.Instance;
  value: R;
} | {
  type: ProviderType.None;
  value: undefined;
};

/**
 * Fluent provider binding methods.
 *
 * @public
 */
export interface FluentBinding<TContract, TReturn> {
  toConstructor(implementation: Constructor<TContract, any>): TReturn;
  toFactory(factory: Factory<TContract>): TReturn;
  toInstance(instance: TContract): TReturn;
}

/**
 * Required options for modules.
 *
 * @public
 */
export interface ModuleOptions {
  container?: Container;
  logger?: Logger;
}

/**
 * Provides a set of dependencies, bound in the `configure` method.
 *
 * @public
 */
export abstract class Module implements ModuleOptions {
  public container?: Container;
  public logger?: Logger;
  protected providers: Map<Contract<any, any>, Provider<any>>;

  constructor() {
    this.logger = NullLogger.global;
    this.providers = new Map();
  }

  public async configure(options: ModuleOptions): Promise<void> {
    this.container = options.container;
    this.logger = options.logger;

    if (this.logger !== undefined) {
      this.logger.debug({ module: this }, 'configuring module');
    }

    this.bindPrototype(Reflect.getPrototypeOf(this));
  }

  public get<C, O extends BaseOptions>(contract: Contract<C, O>): Provider<C> {
    const name = contractName(contract);
    const provider = this.providers.get(contract) as Provider<C>;

    if (this.logger !== undefined) {
      this.logger.debug({ contract: name, provider }, 'fetching contract from module');
    }

    return provider;
  }

  /**
   * Indicate if this module provides a dependency and if so, how.
   *
   * @todo Memoize this if performance becomes a problem.
   */
  public has<C, O extends BaseOptions>(contract: Contract<C, O>): boolean {
    const name = contractName(contract);

    if (this.logger !== undefined) {
      this.logger.debug({ contract: name }, 'searching module for contract');
    }

    return this.providers.has(contract);
  }

  public get size(): number {
    return this.providers.size;
  }

  /**
   * Bind a provider to a contract. This is the core of the module.
   *
   * @todo fix the any in this signature
   * @param contract - the contract to be bound
   * @param type - the type of provider
   * @param value - the class, factory, or instance to bind
   */
  public bindTo<C, I extends C, O extends BaseOptions>(contract: Contract<C, O>, type: ProviderType.Constructor, value: Constructor<I, O>): this;
  public bindTo<C, I extends C, O extends BaseOptions>(contract: Contract<C, O>, type: ProviderType.Factory, value: Factory<I>): this;
  public bindTo<C, I extends C, O extends BaseOptions>(contract: Contract<C, O>, type: ProviderType.Instance, value: I): this;
  public bindTo<C, I extends C, O extends BaseOptions>(contract: Contract<C, O>, type: ProviderType.None): this;
  public bindTo<C, I extends C, O extends BaseOptions>(contract: Contract<C, O>, type: any, value?: any): this {
    const name = contractName(contract);

    if (this.logger !== undefined) {
      this.logger.debug({ contract: name, type, value }, 'binding contract');
    }

    this.providers.set(contract, { type, value });
    return this;
  }

  /**
   * Register a class as the provider for a particular contract. The class will be instantiated after having
   * dependencies resolved, its parameters being the dependencies and any additional arguments passed to the container.
   *
   * @todo this should be protected
   */
  public bind<C, I extends C, O extends BaseOptions>(contract: Contract<C, O>): FluentBinding<I, this> {
    return {
      toConstructor: (constructor) => this.bindTo(contract, ProviderType.Constructor, constructor),
      toFactory: (factory) => this.bindTo(contract, ProviderType.Factory, factory),
      toInstance: (instance) => this.bindTo(contract, ProviderType.Instance, instance),
    };
  }

  public debug() {
    if (isNil(this.logger)) {
      throw new LoggerNotFoundError('module has no logger');
    }

    this.logger.debug('module debug');
    for (const [module, provider] of this.providers.entries()) {
      this.logger.debug({ module, provider }, 'module provides contract');
    }
  }

  protected bindFunction<C, I extends C>(fn: Factory<I>) {
    const provides = getProvides(fn);
    for (const p of provides) {
      this.bindTo(p.contract, ProviderType.Factory, fn);
    }
  }

  protected bindPrototype(proto: object) {
    for (const [/* name */, desc] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
      if (typeof desc.value === 'function') {
        this.bindFunction(desc.value);
      }
    }

    const next = Reflect.getPrototypeOf(proto);
    if (doesExist(next) && next !== proto) {
      this.bindPrototype(next);
    }
  }
}
