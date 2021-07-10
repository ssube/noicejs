import { AnyContract, AnyOptions, BaseOptions, Constructor, Container, Contract, contractName, Factory } from './Container';
import { LoggerNotFoundError } from './error/LoggerNotFoundError';
import { Logger } from './logger/Logger';
import { NullLogger } from './logger/NullLogger';
import { getProvides } from './Provides';
import { doesExist, isNone, mustExist } from './utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Providers for a particular contract.
 *
 * @public
 */
export enum ProviderType {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  None = 0,
  // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/no-shadow
  Constructor,
  // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/no-shadow
  Factory,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Instance,
}

/**
 * Provider definitions.
 *
 * @public
 */
export type Provider<R, O extends BaseOptions> = {
  type: ProviderType.Constructor;
  value: Constructor<R, O>;
} | {
  type: ProviderType.Factory;
  value: Factory<R, O>;
} | {
  type: ProviderType.Instance;
  value: R;
} | {
  type: ProviderType.None;
  value: undefined;
};

export type AnyProvider = Provider<any, AnyOptions>;

/**
 * Fluent provider binding methods.
 *
 * @public
 */
export interface FluentBinding<TContract, TReturn, TOptions extends BaseOptions> {
  toConstructor(implementation: Constructor<TContract, TOptions>): TReturn;
  toFactory(factory: Factory<TContract, TOptions>): TReturn;
  toInstance(instance: TContract): TReturn;
}

/**
 * Required options for modules.
 *
 * @public
 */
export interface ModuleOptions extends BaseOptions {
  logger?: Logger;
}

/**
 * Provides a set of dependencies, bound in the `configure` method.
 *
 * @public
 */
export abstract class Module implements ModuleOptions {
  public logger?: Logger;

  protected containerRef?: Container;
  protected providers: Map<AnyContract, AnyProvider>;

  public get container(): Container {
    return mustExist(this.containerRef);
  }

  constructor() {
    this.logger = NullLogger.global;
    this.providers = new Map();
  }

  public async configure(options: ModuleOptions): Promise<void> {
    this.containerRef = options.container;
    this.logger = options.logger;

    if (this.logger !== undefined) {
      this.logger.debug({ module: this }, 'configuring module');
    }

    const proto = Reflect.getPrototypeOf(this);
    if (proto) {
      this.bindPrototype(proto);
    }
  }

  public get<C, O extends BaseOptions>(contract: Contract<C, O>): Provider<C, O> {
    const name = contractName(contract);
    const provider = this.providers.get(contract) as Provider<C, O>;

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
  public bindTo<C, I extends C, O extends BaseOptions>(contract: Contract<C, O>, type: ProviderType.Factory, value: Factory<I, O>): this;
  public bindTo<C, I extends C, O extends BaseOptions>(contract: Contract<C, O>, type: ProviderType.Instance, value: I): this;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public bindTo<C, I extends C, O extends BaseOptions>(contract: Contract<C, O>, type: ProviderType.None): this;
  public bindTo<C, I extends C, O extends BaseOptions>(contract: Contract<C, O>, type: ProviderType, value?: I | Factory<I, O> | Constructor<I, O>): this {
    const name = contractName(contract);

    if (this.logger !== undefined) {
      this.logger.debug({ contract: name, type, value }, 'binding contract');
    }

    this.providers.set(contract, { type, value } as Provider<I, O>);
    return this;
  }

  /**
   * Register a class as the provider for a particular contract. The class will be instantiated after having
   * dependencies resolved, its parameters being the dependencies and any additional arguments passed to the container.
   *
   * @todo this should be protected
   */
  public bind<C, I extends C, O extends BaseOptions>(contract: Contract<C, O>): FluentBinding<I, this, O> {
    return {
      toConstructor: (constructor) => this.bindTo(contract, ProviderType.Constructor, constructor),
      toFactory: (factory) => this.bindTo(contract, ProviderType.Factory, factory),
      toInstance: (instance) => this.bindTo(contract, ProviderType.Instance, instance),
    };
  }

  public debug(): void {
    if (isNone(this.logger)) {
      throw new LoggerNotFoundError('module has no logger');
    }

    this.logger.debug('module debug');
    for (const [module, provider] of this.providers.entries()) {
      this.logger.debug({ module, provider }, 'module provides contract');
    }
  }

  protected bindFunction<C, I extends C, O extends BaseOptions>(fn: Factory<I, O>): void {
    const provides = getProvides(fn);
    for (const p of provides) {
      this.bindTo(p.contract, ProviderType.Factory, fn);
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  protected bindPrototype(proto: object): void {
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
