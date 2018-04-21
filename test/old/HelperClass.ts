import {Inject} from 'src/Inject';
import {Module} from 'src/Module';
import { Container } from 'src/Container';

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
  public readonly deps: any;
  public readonly args: Array<any>;

  // @Inject(Interface)
  public static create(deps: any, ...args: Array<any>) {
    return new Consumer(deps, ...args);
  }

  constructor(deps: any, ...args: Array<any>) {
    this.deps = deps;
    this.args = args;
  }
}

export class TestModule extends Module {
  public async configure(container: Container) {
    await super.configure(container);

    this.bind(Interface).toConstructor(Implementation);
  }
}
