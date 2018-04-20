import {Constructor, Container, Contract, contractName} from 'src/Container';

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

/**
 * Provides a set of dependencies, bound in the `configure` method.
 */
export abstract class Module {
  protected providers: Map<string, Provider<any>>;

  constructor() {
    this.providers = new Map();
  }

  public abstract async configure(container: Container): Promise<void>;

  public get<C>(contract: Contract<C>): Provider<C> {
    const name = contractName(contract);

    return this.providers.get(name) as Provider<C>;
  }

  /**
   * Indicate if this module provides a dependency and if so, how.
   *
   * @todo Memoize this if performance becomes a problem.
   */
  public has<C>(contract: Contract<C>): boolean {
    const name = contractName(contract);
    return this.providers.has(name);
  }

  public size(): number {
    return this.providers.size;
  }

  /**
   * Register a class as the provider for a particular contract. The class will be instantiated after having
   * dependencies resolved, its parameters being the dependencies and any additional arguments passed to the container.
   */
  public bind<C, I extends C>(contract: Contract<C>): FluentBinding<I, this> {
    const name = contractName(contract);
    return {
      toConstructor: (constructor) => {
        this.providers.set(name, {type: ProviderType.Constructor, value: constructor});
        return this;
      },
      toFactory: (factory) => {
        this.providers.set(name, {type: ProviderType.Factory, value: factory});
        return this;
      },
      toInstance: (instance) => {
        this.providers.set(name, {type: ProviderType.Instance, value: instance});
        return this;
      }
    };
  }
}
