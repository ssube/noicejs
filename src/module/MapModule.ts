import { BaseOptions, Constructor, Contract, isConstructor } from '../Container.js';
import { Module, ModuleOptions } from '../Module.js';

export type ProviderValue<TReturn, TOptions extends BaseOptions> = TReturn | Constructor<TReturn, TOptions>;
export type ProviderMap<TReturn, TOptions extends BaseOptions> = Map<Contract<TReturn, TOptions>, ProviderValue<TReturn, TOptions>>;
export type ProviderMapLike = ProviderMap<unknown, BaseOptions> | {
  [key: string | symbol]: ProviderValue<unknown, BaseOptions>;
};

export interface MapModuleOptions {
  providers: ProviderMapLike;
}

/**
 * Reference module that provides dependencies from a map-like of instances or constructors.
 *
 * To add providers to this module, extend it with `@Provides` methods.
 *
 * @public
 */
export class MapModule extends Module {
  private readonly providerMap: ProviderMap<unknown, BaseOptions>;

  constructor(options: MapModuleOptions) {
    super();

    if (options.providers instanceof Map) {
      this.providerMap = new Map(options.providers);
    } else {
      this.providerMap = new Map(Object.entries<ProviderValue<unknown, BaseOptions>>(options.providers));
    }
  }

  public async configure(options: ModuleOptions) {
    await super.configure(options);

    for (const [contract, value] of this.providerMap) {
      if (this.logger !== undefined) {
        this.logger.debug({ contract, value }, 'binding mapped provider');
      }

      if (isConstructor(value)) {
        this.bind(contract).toConstructor(value);
      } else {
        this.bind(contract).toInstance(value);
      }
    }
  }
}
