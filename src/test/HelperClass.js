import {Inject, Injector, Module} from '../main/inject';

export class Interface {
  // empty
}

export class Implementation {
  constructor(...args) {
    this._args = args;
  }
}

@Inject(Interface)
export class Consumer {
  @Inject(Interface)
  static create(iface, ...args) {
    return new Consumer(iface, ...args);
  }

  constructor(iface, ...args) {
    this._iface = iface;
    this._args = args;
  }
}

export class TestModule extends Module {
  configure() {
    this.bind(Interface).to(Implementation);
  }
}

export class TestInjector extends Injector {
  getDependencies() {
    return [];
  }
}
