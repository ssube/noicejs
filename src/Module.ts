import { BaseOptions, Constructor, Contract, contractName } from 'src/Container';
import { LoggerNotFoundError } from 'src/error/LoggerNotFoundError';
import { Logger } from 'src/logger/Logger';
import { NullLogger } from 'src/logger/NullLogger';
import { getProvides } from 'src/Provides';

export enum ProviderType {
  None = 0,
  Constructor,
  Factory,
  Instance,
}

export type Factory<R> = (options: any) => Promise<R>;
export type Implementation<T> = Constructor<T, any> | Factory<T>;
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

export interface FluentBinding<TContract, TReturn> {
  toConstructor(implementation: Constructor<TContract, any>): TReturn;
  toFactory(factory: Factory<TContract>): TReturn;
  toInstance(instance: TContract): TReturn;
}

export interface ModuleOptions extends BaseOptions {
  logger: Logger;
}

/**
 * Provides a set of dependencies, bound in the `configure` method.
 */
export abstract class Module {
  protected logger: Logger;
  protected providers: Map<Contract<any>, Provider<any>>;

  constructor() {
    this.logger = NullLogger.global;
    this.providers = new Map();
  }

  public async configure(options: ModuleOptions): Promise<void> {
    this.logger = options.logger;
    this.logger.debug({ module: this }, 'configuring module');
    this.bindPrototype(Reflect.getPrototypeOf(this));
  }

  public get<C>(contract: Contract<C>): Provider<C> {
    const name = contractName(contract);
    const provider = this.providers.get(contract) as Provider<C>;

    this.logger.debug({ contract: name, provider }, 'fetching contract from module');

    return provider;
  }

  /**
   * Indicate if this module provides a dependency and if so, how.
   *
   * @TODO Memoize this if performance becomes a problem.
   */
  public has<C>(contract: Contract<C>): boolean {
    const name = contractName(contract);

    this.logger.debug({ contract: name }, 'searching module for contract');

    return this.providers.has(contract);
  }

  public get size(): number {
    return this.providers.size;
  }

  /**
   * Bind a provider to a contract. This is the core of the module.
   *
   * @TODO fix the any in this signature
   * @param contract the contract to be bound
   * @param type the type of provider
   * @param value the class, factory, or instance to bind
   */
  public bindTo<C, I extends C>(contract: Contract<C>, type: ProviderType.Constructor, value: Constructor<I, any>): this;
  public bindTo<C, I extends C>(contract: Contract<C>, type: ProviderType.Factory, value: Factory<I>): this;
  public bindTo<C, I extends C>(contract: Contract<C>, type: ProviderType.Instance, value: I): this;
  public bindTo<C, I extends C>(contract: Contract<C>, type: ProviderType.None): this;
  public bindTo<C, I extends C>(contract: Contract<C>, type: any, value?: any): this {
    const name = contractName(contract);
    this.logger.debug({ contract: name, type, value }, 'binding contract');
    this.providers.set(contract, { type, value });
    return this;
  }

  /**
   * Register a class as the provider for a particular contract. The class will be instantiated after having
   * dependencies resolved, its parameters being the dependencies and any additional arguments passed to the container.
   *
   * @TODO this should be protected
   */
  public bind<C, I extends C>(contract: Contract<C>): FluentBinding<I, this> {
    return {
      toConstructor: (constructor) => this.bindTo(contract, ProviderType.Constructor, constructor),
      toFactory: (factory) => this.bindTo(contract, ProviderType.Factory, factory),
      toInstance: (instance) => this.bindTo(contract, ProviderType.Instance, instance),
    };
  }

  public debug() {
    if (this.logger === undefined) {
      throw new LoggerNotFoundError('no logger available to print debug');
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
    if (next !== undefined && next !== null && next !== proto) {
      this.bindPrototype(next);
    }
  }
}
