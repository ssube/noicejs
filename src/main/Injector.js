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

      //@TODO: get rid of this side effect
      let module = null;
      const val = find(
        allowedKeys.filter(it => dep.hasOwnProperty(it)).map(it => dep[it]),
        val => (module = find(this._modules, m => m.has(val)))
      );

      if (val && module) {
        if (this._logger) {
          this._logger.debug({module, val}, 'Using val from module to meet dependency.');
        }

        const provider = module.getProvider(val);
        if (provider) {
          if (this._logger) {
            this._logger.debug({module, provider}, 'Executing provider from module.');
          }

          return this.execute(provider, module);
        }

        const binding = module.getBinding(val);
        if (Injector.isCallable(binding)) {
          if (this._logger) {
            this._logger.debug({binding, module}, 'Creating binding from module.');
          }

          return this.create(binding);
        } else {
          if (this._logger) {
            this._logger.debug({binding, module}, 'Returning binding from module.');
          }

          return binding;
        }
      } else {
        throw new Error('Unable to satisfy dependency.', dep);
      }
    });
  }

  execute(fn, scope, params = []) {
    const args = this.getDependencies(fn).concat(params);
    return fn.apply(scope, args);
  }

  create(ctor, ...params) {
    const args = this.getDependencies(ctor).concat(params);
    return new ctor(...args);
  }
}
