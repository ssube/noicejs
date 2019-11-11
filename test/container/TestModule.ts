import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { Container } from '../../src/Container';
import { InvalidProviderError } from '../../src/error/InvalidProviderError';
import { MissingValueError } from '../../src/error/MissingValueError';
import { Module, ModuleOptions } from '../../src/Module';
import { Consumer, Implementation, Interface, TestModule } from '../HelperClass';
import { describeLeaks, itLeaks } from '../helpers/async';

/* eslint-disable no-null/no-null, @typescript-eslint/no-explicit-any */

describeLeaks('container', async () => {
  itLeaks('should handle a module returning bad providers', async () => {
    class BadModule extends Module {
      public async configure(options: ModuleOptions) {
        this.bind('d').toInstance({});
      }

      public get(contract: any): any {
        return {
          type: 'invalid',
          value: null,
        };
      }
    }

    const module = new BadModule();
    const container = Container.from(module);
    await container.configure();

    await expect(container.create('d')).to.be.rejectedWith(InvalidProviderError);
  });

  itLeaks('should throw when the contract has no provider', async () => {
    const module = new TestModule();
    const container = Container.from(module);
    await container.configure();

    await expect(container.create('d')).to.be.rejectedWith(MissingValueError);
  });

  itLeaks('should inject a dependency from a module', async () => {
    const ctr = Container.from(new TestModule());
    await ctr.configure();

    const impl = await ctr.create(Consumer);
    expect(impl.deps[Interface.name]).to.be.an.instanceof(Implementation);
  });

  itLeaks('should throw when a module is missing a provider', async () => {
    const module = ineeda<Module>({
      get() {
        return null;
      },
    });
    const container = Container.from(module);

    return expect(container.provide(module, '', {}, [])).to.eventually.be.rejectedWith(MissingValueError);
  });
});
