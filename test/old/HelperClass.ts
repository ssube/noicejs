import { Container } from 'src/Container';
import { Inject } from 'src/Inject';
import { Module } from 'src/Module';

export class Interface {
  // empty
}

export class Implementation {
  public readonly args: Array<any>;
  public readonly deps: any;

  constructor(deps: any, ...args: Array<any>) {
    this.args = args;
    this.deps = deps;
  }
}

@Inject(Interface)
export class Consumer {
  // @Inject(Interface)
  public static create(deps: any, ...args: Array<any>) {
    return new Consumer(deps, ...args);
  }

  public readonly args: Array<any>;
  public readonly deps: any;

  constructor(deps: any, ...args: Array<any>) {
    console.log('===marker', 'consumer', deps, args);
    this.args = args;
    this.deps = deps;
  }
}

export class TestModule extends Module {
  public async configure(container: Container) {
    await super.configure(container);

    this.bind(Interface).toConstructor(Implementation);
  }
}
