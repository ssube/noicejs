import { Inject } from '../src/Inject.js';
import { Module, ModuleOptions } from '../src/Module.js';

/* eslint-disable @typescript-eslint/no-explicit-any */

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
  public readonly args: Array<any>;
  public readonly deps: any;

  constructor(deps: any, ...args: Array<any>) {
    this.args = args;
    this.deps = deps;
  }
}

export class TestModule extends Module {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    this.bind(Interface).toConstructor(Implementation);
  }
}
