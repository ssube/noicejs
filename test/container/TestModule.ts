import { expect } from 'chai';
import { stub } from 'sinon';

import { Container } from '../../src/Container';
import { InvalidProviderError } from '../../src/error/InvalidProviderError';
import { MissingValueError } from '../../src/error/MissingValueError';
import { Module, ModuleOptions } from '../../src/Module';
import { MapModule } from '../../src/module/MapModule';
import { Consumer, Implementation, Interface, TestModule } from '../HelperClass';

/* eslint-disable no-null/no-null, @typescript-eslint/no-explicit-any */

describe('container', async () => {
  it('should handle a module returning bad providers', async () => {
    class BadModule extends Module {
      public async configure(_options: ModuleOptions) {
        this.bind('d').toInstance({});
      }

      public get(_contract: any): any {
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

  it('should throw when the contract has no provider', async () => {
    const module = new TestModule();
    const container = Container.from(module);
    await container.configure();

    await expect(container.create('d')).to.be.rejectedWith(MissingValueError);
  });

  it('should inject a dependency from a module', async () => {
    const ctr = Container.from(new TestModule());
    await ctr.configure();

    const impl = await ctr.create(Consumer);
    expect(impl.deps[Interface.name]).to.be.an.instanceof(Implementation);
  });

  it('should throw when a module is missing a provider', async () => {
    const module = new MapModule({
      providers: {},
    });
    const getStub = stub(module, 'get').returns(null as any);

    const container = Container.from(module);
    await expect(container.provide(module, '', {}, [])).to.eventually.be.rejectedWith(MissingValueError);
    expect(getStub).to.have.callCount(1);
  });
});
