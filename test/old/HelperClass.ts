import {Inject} from 'src/Inject';
import {Module} from 'src/Module';

export class Interface {
  // empty
}

export class Implementation {
  private args: Array<any>;

  constructor(...args: Array<any>) {
    this.args = args;
  }
}

@Inject(Interface)
export class Consumer {
  public readonly iface: any;
  public readonly args: Array<any>;

  @Inject(Interface)
  static create(iface: any, ...args: Array<any>) {
    return new Consumer(iface, ...args);
  }

  constructor(iface: any, ...args: Array<any>) {
    this.iface = iface;
    this.args = args;
  }
}

export class TestModule extends Module {
  public async configure() {
    this.bind(Interface).toConstructor(Implementation);
  }
}
