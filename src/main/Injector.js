import Options from './Options';

export default class Injector {
  static isConstructor(fn) {
    return fn.prototype && fn === fn.prototype.constructor;
  }

  static isFunction(fn) {
    return typeof fn === 'function';
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

  get modules() {
    return this._modules;
  }

  getDependency(module, it) {
    // Thanks to the has check in find, one of provider
    // or binding is guaranteed to be present.
    const provider = module.getProvider(it);
    if (provider) {
      return this.execute(provider, module, [], {detect: false});
    }

    const binding = module.getBinding(it);
    if (Injector.isFunction(binding)) {
      return this.execute(binding, null);
    } else {
      return binding;
    }
  }

  /**
   * refactor this to handle names
   */
  getDependencies(target) {
    const opts = Options.getOptions(target);
    return opts.deps.map(dep => {
      const {fn, name} = dep;

      // Prefer named dependencies
      //@TODO: turn this into some sort of loop to allow for more fields
      const moduleForName = this._modules.find(m => m.has(name));
      if (moduleForName) {
        return this.getDependency(moduleForName, name);
      }

      const moduleForFunc = this._modules.find(m => m.has(fn));
      if (moduleForFunc) {
        return this.getDependency(moduleForFunc, fn);
      }

      throw new Error('Unable to find any implementation for interface.', fn);
    });
  }

  execute(fn, scope, params = [], {detect = true} = {}) {
    const args = this.getDependencies(fn).concat(params);

    // if we are allowed to detect the function type and it appears to be a ctor
    if (detect && Injector.isConstructor(fn)) {
      return new fn(...args);
    } else {
      return fn.apply(scope, args);
    }
  }

  create(ctor, ...params) {
    return this.execute(ctor, null, params);
  }
}
