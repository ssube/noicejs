import Options from './Options';

export const allowedKeys = ['name', 'fn'];

function find(data, cb) {
  if (data.find) {
    return data.find(cb);
  }

  for (let it of data) {
    if (cb(it)) {
      return it;
    }
  }

  return undefined;
}

export default class Injector {
  static isCallable(fn) {
    return fn && typeof fn.apply === 'function' && typeof fn.call === 'function';
  }

  static fromParams(params) {
    const [p0] = params;
    if (p0 instanceof Injector) {
      return p0;
    } else {
      const {injector} = p0;
      if (injector instanceof Injector) {
        return injector;
      } else {
        throw new Error('unable to locate injector');
      }
    }
  }

  constructor(...modules) {
    this._modules = modules;
    this._modules.forEach(module => module.configure());
  }

  extend(...modules) {
    return new Injector(this.modules.concat(modules));
  }

  set logger(value) {
    this._logger = value;
  }

  get modules() {
    return this._modules;
  }

  /**
   * refactor this to handle names
   */
  getDependencies(target) {
    if (this._logger) {
      this._logger.debug({target}, 'Getting dependencies.');
    }

    const opts = Options.getOptions(target);
    return opts.deps.map(dep => {
      const {fn, name} = dep;

      const val = fn || name;
      const module = this.getModule(val);

      if (module) {
        return this.resolve(module, val);
      } else {
        throw new Error('Unable to satisfy dependency.', dep);
      }
    });
  }

  resolve(module, fn, args = []) {
    if (this._logger) {
      this._logger.debug({module, val}, 'Using val from module to meet dependency.');
    }

    const provider = module.getProvider(fn);
    if (provider) {
      if (this._logger) {
        this._logger.debug({module, provider}, 'Executing provider from module.');
      }

      return this.execute(provider, module, args);
    }

    const binding = module.getBinding(fn);
    if (Injector.isCallable(binding)) {
      if (this._logger) {
        this._logger.debug({binding, module}, 'Creating binding from module.');
      }

      return this.create(binding, ...args);
    } else {
      if (this._logger) {
        this._logger.debug({binding, module}, 'Returning binding from module.');
      }

      return binding;
    }
  }

  getModule(fn) {
    return find(this._modules, m => m.has(fn));
  }

  execute(fn, scope, params = []) {
    const deps = this.getDependencies(fn);
    const args = deps.concat(params);

    const module = this.getModule(fn);
    const provider = module ? module.getProvider(fn) : null;
    if (provider) {
      const val = provider.apply(scope, args);
      if (this._logger) {
        this._logger.debug({
          args, deps, fn, provider, val
        }, 'Executed provider in place of function.');
      }
      return val;
    } else {
      const val = fn.apply(scope, args);
      if (this._logger) {
        this._logger.debug({
          args, deps, fn, val
        }, 'Executed original function.');
      }
      return val;
    }
  }

  create(ctor, ...params) {
    const deps = this.getDependencies(ctor);
    const args = deps.concat(params);

    const module = this.getModule(ctor);
    if (!module) {
      const val = new ctor(...args);
      if (this._logger) {
        this._logger.debug({
          args, ctor, deps, val
        }, 'Instantiated original constructor.');
      }
      return val;
    }

    const provider = module.getProvider(ctor);
    if (provider) {
      const val = this.execute(provider, module, args);
      if (this._logger) {
        this._logger.debug({
          args, ctor, deps, val
        }, 'Executed provider in place of constructor.');
      }
      return val;
    }

    const binding = module.getBinding(ctor);
    if (binding) {
      const val = new binding(...args);
      if (this._logger) {
        this._logger.debug({
          args, ctor, deps, val
        }, 'Instantiated resolved constructor.');
      }
      return val;
    }

    throw new Error('A module claimed to provide constructor but was unable.');
  }
}
