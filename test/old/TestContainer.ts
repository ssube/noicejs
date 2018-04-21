import { expect } from 'chai';
import { Container } from 'src/Container';
import { Inject } from 'src/Inject';
import { Module } from 'src/Module';
import { Provides } from 'src/Provides';
import { Consumer, Implementation, Interface, TestModule } from './HelperClass';
import { itAsync } from '../helpers/async';

describe('container', () => {
  itAsync('should take a list of modules', async () => {
    class SubModule extends Module {
      public async configure() {
        // noop
      }
    }

    const modules = [new SubModule(), new SubModule()];
    const ctr = Container.from(...modules);
    await ctr.configure();

    expect(ctr.getModules()).to.deep.equal(modules);
  });

  itAsync('should inject a dependency from a module', async () => {
    const ctr = Container.from(new TestModule());
    await ctr.configure();

    const impl = await ctr.create(Consumer);
    expect(impl.deps.interface).to.be.an.instanceof(Implementation);
  });

  itAsync('should inject a dependency into a factory method', async () => {
    const ctr = Container.from(new TestModule());
    await ctr.configure();

    const impl = await ctr.create(Consumer, {}, 3);
    expect(impl.args).to.deep.equal([3]);
    expect(impl.deps.interface).to.be.an.instanceof(Implementation);
  });

  itAsync('should throw on missing dependencies', async () => {
    class Outerface { /* empty */ }

    // TestModule does not provide Outerface (it can't possibly)
    const ctr = Container.from(new TestModule());
    await ctr.configure();

    @Inject(Outerface)
    class FailingConsumer {
      private di: any;

      constructor(di: any) {
        this.di = di;
      }
    }

    return expect(ctr.create(FailingConsumer)).to.eventually.throw();
  });

  itAsync('should pass arguments to the constructor', async () => {
    const ctr = Container.from(new TestModule());
    await ctr.configure();

    const args = ['a', 'b', 'c'];
    const impl = await ctr.create(Consumer, {}, ...args);
    expect(impl.args).to.deep.equal(args);
  });

  // @todo: fix Provides
  xit('should execute providers', async () => {
    let counter = 0;

    class SubModule extends Module {
      public async configure() {
        // noop
      }

      @Provides(Interface)
      public async create() {
        ++counter;
        return new Implementation();
      }
    }

    const ctr = Container.from(new SubModule());
    await ctr.configure();

    const impl = await ctr.create(Consumer);
    expect(impl.deps.interface).to.be.an.instanceof(Implementation);
    expect(counter).to.equal(1);
  });

  itAsync('should provide dependencies to providers', async () => {
    class Outerface { /* empty */ }
    const outerInstance = new Outerface();

    let counter = 0;
    class SubModule extends Module {
      public async configure() {
        this.bind(Outerface).toInstance(outerInstance);
      }

      // @Inject(Outerface)
      @Provides(Interface)
      public create(outer: any) {
        ++counter;
        return new Implementation(outer);
      }
    }

    const ctr = Container.from(new SubModule());
    await ctr.configure();

    const impl = await ctr.create(Consumer);
    expect(impl.deps.interface).to.be.an.instanceof(Implementation);
    expect(impl.args).to.deep.equal([outerInstance]);
    expect(counter).to.equal(1);
  });

  itAsync('should invoke binding functions', async () => {
    let counter = 0;

    class SubModule extends Module {
      public async configure() {
        this.bind(Interface).toFactory(async (...args: Array<any>) => {
          ++counter;
          return new Implementation(...args);
        });
      }
    }

    const ctr = Container.from(new SubModule());
    await ctr.configure();

    const impl = await ctr.create(Consumer);

    expect(impl.deps.interface).to.be.an.instanceof(Implementation);
    expect(counter).to.equal(1);
  });

  itAsync('should allow named bindings', async () => {
    const name = 'foobar';
    const inst = {};

    class SubModule extends Module {
      public async configure() {
        this.bind(name).toInstance(inst);
      }
    }

    const ctr = Container.from(new SubModule());
    await ctr.configure();

    @Inject(name)
    class NameConsumer {
      public deps: any;

      constructor(deps: any) {
        this.deps = deps;
      }
    }

    const impl = await ctr.create(NameConsumer);
    expect(impl.deps[name]).to.equal(inst);
  });

  itAsync('should resolve constructors', async () => {
    class Other { }
    class SubModule extends Module {
      public async configure() {
        this.bind(Interface).toConstructor(Implementation);
      }
    }

    const ctr = Container.from(new SubModule());
    await ctr.configure();

    const impl = await ctr.create(Interface);
    expect(impl).to.be.an.instanceof(Implementation);

    const other = await ctr.create(Other);
    expect(other).to.be.an.instanceof(Other);
  });

  itAsync('should resolve providers', async () => {
    class Other { }
    class SubModule extends Module {
      public async createInterface(...args: Array<any>) {
        return new Implementation(...args);
      }

      public async configure() {
        this.bind(Interface).toFactory((...args: Array<any>) => this.createInterface(...args));
      }
    }

    const ctr = Container.from(new SubModule());
    await ctr.configure();

    const impl = await ctr.create(Interface);
    expect(impl).to.be.an.instanceof(Implementation);
  });
});
