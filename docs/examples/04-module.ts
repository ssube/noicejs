import { Module, ModuleOptions } from 'noicejs';

class NetworkThing {}

class NetworkModule extends Module {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    this.bind('foo').toConstructor(NetworkThing);
  }
}
