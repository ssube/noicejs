import { expect } from 'chai';
import { spy } from 'sinon';
import { Container } from 'src/Container';
import { Inject } from 'src/Inject';
import { Module, ModuleOptions } from 'src/Module';
import { Provides } from 'src/Provides';
import { itAsync } from 'test/helpers/async';
import { Consumer, Implementation, Interface, TestModule } from 'test/old/HelperClass';

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
    expect(impl.deps[Interface.name]).to.be.an.instanceof(Implementation);
  });

  itAsync('should inject a dependency into a factory method', async () => {
    const ctr = Container.from(new TestModule());
    await ctr.configure();

    const impl = await ctr.create(Consumer, {}, 3);
    expect(impl.args).to.deep.equal([3]);
    expect(impl.deps[Interface.name]).to.be.an.instanceof(Implementation);
  });

  itAsync('should throw on missing dependencies', async () => {
    class Outerface { /* empty */ }

    // TestModule does not provide Outerface (it can't possibly)
    const ctr = Container.from(new TestModule());
    await ctr.configure();

    @Inject('outerface')
    class FailingConsumer {
      private di: any;

      constructor(di: any) {
        this.di = di;
      }
    }

    expect(ctr.create(FailingConsumer)).to.eventually.be.rejected;
  });

  itAsync('should pass arguments to the constructor', async () => {
    const ctr = Container.from(new TestModule());
    await ctr.configure();

    const args = ['a', 'b', 'c'];
    const impl = await ctr.create(Consumer, {}, ...args);
    expect(impl.args).to.deep.equal(args);
  });

  itAsync('should execute providers', async () => {
    const modSpy = spy();

    class SubModule extends Module {
      @Provides(Interface)
      public async create() {
        modSpy();
        return ctr.create(Implementation);
      }
    }

    const mod = new SubModule();
    const ctr = Container.from(mod);
    await ctr.configure();

    const impl = await ctr.create(Consumer);
    expect(modSpy).to.have.been.calledOnce;
    expect(impl.deps[Interface.name]).to.be.an.instanceof(Implementation);
  });

  itAsync('should provide dependencies to providers', async () => {
    class Outerface { /* empty */ }
    const outerInstance = new Outerface();

    const modSpy = spy();
    class SubModule extends Module {
      public async configure(options: ModuleOptions) {
        await super.configure(options);
        this.bind(Outerface).toInstance(outerInstance);
      }

      @Inject(Outerface)
      @Provides(Interface)
      public async create(outer: { outerface: Outerface }) {
        this.logger.debug({ outer }, 'submodule create');
        modSpy(outer);
        return ctr.create(Implementation, outer as any);
      }
    }

    const ctr = Container.from(new SubModule());
    await ctr.configure();

    const impl = await ctr.create(Consumer);

    expect(modSpy).to.have.been.calledOnce;
    expect(impl.deps[Interface.name]).to.be.an.instanceOf(Implementation);
    expect(impl.deps[Interface.name].deps[Outerface.name]).to.equal(outerInstance);
  });

  itAsync('should invoke binding functions', async () => {
    let counter = 0;

    class SubModule extends Module {
      public async configure() {
        this.bind(Interface).toFactory(async (deps: any, ...args: Array<any>) => {
          ++counter;
          return new Implementation(deps, ...args);
        });
      }
    }

    const ctr = Container.from(new SubModule());
    await ctr.configure();

    const impl = await ctr.create(Consumer);

    expect(impl.deps[Interface.name]).to.be.an.instanceof(Implementation);
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
      public async createInterface(deps: any, ...args: Array<any>) {
        return new Implementation(deps, ...args);
      }

      public async configure() {
        this.bind(Interface).toFactory((deps: any, ...args: Array<any>) => this.createInterface(deps, ...args));
      }
    }

    const ctr = Container.from(new SubModule());
    await ctr.configure();

    const impl = await ctr.create(Interface);
    expect(impl).to.be.an.instanceof(Implementation);
  });
});
