import { isFunction } from 'lodash';

import { BaseOptions, Constructor, Container, Contract, contractName } from 'src/Container';
import { Logger } from 'src/logger/Logger';
import { NullLogger } from 'src/logger/NullLogger';
import { getProvides } from 'src/Provides';

export enum ProviderType {
  None = 0,
  Constructor,
  Factory,
  Instance
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
  protected providers: Map<string, Provider<any>>;

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
    const provider = this.providers.get(name) as Provider<C>;

    this.logger.debug({ name, provider }, 'module get provider');

    return provider;
  }

  /**
   * Indicate if this module provides a dependency and if so, how.
   *
   * @todo Memoize this if performance becomes a problem.
   */
  public has<C>(contract: Contract<C>): boolean {
    const name = contractName(contract);

    this.logger.debug({ name }, 'module has provider');

    return this.providers.has(name);
  }

  public get size(): number {
    return this.providers.size;
  }

  /**
   * Bind a provider to a contract. This is the core of the module.
   *
   * @todo fix the any in this signature
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
    this.logger.debug({ contract, name, type, value }, 'binding contract');
    this.providers.set(name, { type, value });
    return this;
  }

  /**
   * Register a class as the provider for a particular contract. The class will be instantiated after having
   * dependencies resolved, its parameters being the dependencies and any additional arguments passed to the container.
   *
   * @todo this should be protected
   */
  public bind<C, I extends C>(contract: Contract<C>): FluentBinding<I, this> {
    return {
      toConstructor: (constructor) => this.bindTo(contract, ProviderType.Constructor, constructor),
      toFactory: (factory) => this.bindTo(contract, ProviderType.Factory, factory),
      toInstance: (instance) => this.bindTo(contract, ProviderType.Instance, instance)
    };
  }

  public debug() {
    if (!this.logger) {
      throw new Error('no logger available to print debug');
    }

    this.logger.debug('module debug');
    for (const [name, provider] of this.providers.entries()) {
      this.logger.debug({ name, provider }, 'module provides contract');
    }
  }

  protected bindFunction<C, I extends C>(fn: Factory<I>) {
    const provides = getProvides(fn);
    for (const p of provides) {
      this.bindTo(p.contract, ProviderType.Factory, fn);
    }
  }

  protected bindPrototype(proto: any) {
    for (const [name, desc] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
      if (isFunction(desc.value)) {
        this.bindFunction(desc.value);
      }
    }

    if (proto.prototype) {
      this.bindPrototype(proto.prototype);
    }
  }
}
