import { isFunction } from 'lodash';

import { BaseOptions, Constructor, Container, Contract, contractName } from 'src/Container';
import { Logger } from 'src/Logger';
import { getProvides } from 'src/Provides';

export enum ProviderType {
  None,
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
  };

export interface FluentBinding<TContract, TReturn> {
  toConstructor(implementation: Constructor<TContract, any>): TReturn;
  toFactory(factory: Factory<TContract>): TReturn;
  toInstance(instance: TContract): TReturn;
}

export interface ModuleOptions extends BaseOptions {
  logger?: Logger;
}

/**
 * Provides a set of dependencies, bound in the `configure` method.
 */
export abstract class Module {
  protected logger: Logger | undefined;
  protected providers: Map<string, Provider<any>>;

  constructor() {
    this.providers = new Map();
  }

  public async configure(options: ModuleOptions): Promise<void> {
    this.logger = options.logger;

    const proto: any = Reflect.getPrototypeOf(this);
    for (const k of Object.getOwnPropertyNames(proto)) {
      const v = proto[k];
      if (isFunction(v)) {
        const provides = getProvides(v);
        for (const p of provides) {
          this.bind(p.contract).toFactory(v);
        }
      }
    }

  }

  public get<C>(contract: Contract<C>): Provider<C> {
    const name = contractName(contract);
    const provider = this.providers.get(name) as Provider<C>;

    if (this.logger) {
      this.logger.debug({name, provider}, 'module get provider');
    }

    return provider;
  }

  /**
   * Indicate if this module provides a dependency and if so, how.
   *
   * @todo Memoize this if performance becomes a problem.
   */
  public has<C>(contract: Contract<C>): boolean {
    const name = contractName(contract);

    if (this.logger) {
      this.logger.debug({name}, 'module has provider');
    }

    return this.providers.has(name);
  }

  public get size(): number {
    return this.providers.size;
  }

  /**
   * Register a class as the provider for a particular contract. The class will be instantiated after having
   * dependencies resolved, its parameters being the dependencies and any additional arguments passed to the container.
   *
   * @todo this should be protected
   */
  public bind<C, I extends C>(contract: Contract<C>): FluentBinding<I, this> {
    const name = contractName(contract);

    if (this.logger) {
      this.logger.debug({name}, 'binding contract to name');
    }

    return {
      toConstructor: (constructor) => {
        this.providers.set(name, { type: ProviderType.Constructor, value: constructor });
        return this;
      },
      toFactory: (factory) => {
        this.providers.set(name, { type: ProviderType.Factory, value: factory });
        return this;
      },
      toInstance: (instance) => {
        this.providers.set(name, { type: ProviderType.Instance, value: instance });
        return this;
      }
    };
  }

  public debug() {
    if (!this.logger) {
      throw new Error('no logger available to print debug');
    }

    this.logger.debug('module debug');
    for (const [name, provider] of this.providers.entries()) {
      this.logger.debug({name, provider}, 'module provides contract');
    }
  }
}
