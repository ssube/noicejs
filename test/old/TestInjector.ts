import {expect} from 'chai';
import {Container} from 'src/Container';
import {Inject} from 'src/Inject';
import {Module} from 'src/Module';
import {Interface, Implementation, Consumer, TestModule} from './HelperClass';
import { itAsync } from '../helpers/async';

describe('Injector class', () => {
  itAsync('should take a list of modules', async () => {
    class SubModule extends Module {
      public async configure() {
        // noop
      }
    }

    const modules = [new SubModule(), new SubModule()];
    const injector = Container.from(...modules);

    expect(injector.getModules()).to.deep.equal(modules);
  });

  itAsync('should inject a dependency from a module', async () => {
    const ctr = Container.from(new TestModule());
    const impl =await ctr.create(Consumer);

    expect(impl.iface).to.be.an.instanceof(Implementation);
  });

  itAsync('should inject a dependency into a factory method', async () => {
    const inj = Container.from(new TestModule());
    const impl = await inj.create(Consumer, [3]);

    expect(impl.iface).to.be.an.instanceof(Implementation);
    expect(impl.args).to.deep.equal([3]);
  });

  itAsync('should throw on missing dependencies', async () => {
    class Outerface { /* empty */ }

    // TestModule does not provide Outerface (it can't possibly)
    const inj = Container.from(new TestModule());

    @Inject(Outerface)
    class FailingConsumer {
      private di: any;

      constructor(di: any) {
        this.di = di;
      }
    }

    expect(() => {
      inj.create(FailingConsumer);
    }).to.throw();
  });

  itAsync('should pass arguments to the constructor', async () => {
    const inj = Container.from(new TestModule());
    const args = ['a', 'b', 'c'];
    const impl = await inj.create(Consumer, ...args);

    expect(impl.args).to.deep.equal(args);
  });

  itAsync('should execute providers', async () => {
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

    const inj = Container.from(new SubModule());
    const impl = await inj.create(Consumer);

    expect(impl.iface).to.be.an.instanceof(Implementation);
    expect(counter).to.equal(1);
  });

  itAsync('should provide dependencies to providers', async () => {
    class Outerface { /* empty */ }

    let counter = 0, outerInstance = new Outerface();

    class SubModule extends Module {
      public async configure() {
        this.bind(Outerface).toInstance(outerInstance);
      }

      @Inject(Outerface)
      @Provides(Interface)
      create(outer: any) {
        ++counter;
        return new Implementation(outer);
      }
    }

    const ctr = Container.from(new SubModule());
    const impl = await ctr.create(Consumer);

    expect(impl.iface).to.be.an.instanceof(Implementation);
    expect(impl.iface.args).to.deep.equal([outerInstance]);
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

    const inj = Container.from(new SubModule());
    const impl = await inj.create(Consumer);

    expect(impl.iface).to.be.an.instanceof(Implementation);
    expect(counter).to.equal(1);
  });

  itAsync('should allow named bindings', async () => {
    const name = 'foobar', inst = {};

    class SubModule extends Module {
      public async configure() {
        this.bind(name).toInstance(inst);
      }
    }

    const inj = Container.from(new SubModule());

    @Inject(name)
    class NameConsumer {
      public arg0: any;

      constructor(arg0: any) {
        this.arg0 = arg0;
      }
    }

    const impl = await inj.create(NameConsumer);
    expect(impl.arg0).to.equal(inst);
  });

  itAsync('should resolve constructors', async () => {
    class Other { }
    class SubModule extends Module {
      public async configure() {
        this.bind(Interface).toConstructor(Implementation);
      }
    }

    const inj = Container.from(new SubModule());
    const impl = await inj.create(Interface);
    expect(impl).to.be.an.instanceof(Implementation);
    const other = inj.create(Other);
    expect(other).to.be.an.instanceof(Other);
  });

  it('should resolve providers', () => {
    class Other { }
    class SubModule extends Module {
      async createInterface(...args: Array<any>) {
        return new Implementation(...args);
      }

      public async configure() {
        this.bind(Interface).toFactory((...args: Array<any>) => this.createInterface(...args));
      }
    }

    const inj = Container.from(new SubModule());
    const impl = inj.create(Interface);
    expect(impl).to.be.an.instanceof(Implementation);
  });
});