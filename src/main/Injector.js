import Options from './Options';

export const allowedKeys = ['name', 'fn'];

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

  /**
   * refactor this to handle names
   */
  getDependencies(target) {
    const opts = Options.getOptions(target);
    return opts.deps.map(dep => {
      const {fn, name} = dep;

      //@TODO: get rid of this side effect
      let module = null;
      const val = allowedKeys
        .filter(it => dep.hasOwnProperty(it)) // from keys that are present
        .map(it => dep[it])                   // get the values
        .find(val => {                        // find the first one with a module
          return (module = this._modules.find(m => m.has(val)));
        });

      if (val && module) {
        const provider = module.getProvider(val);
        if (provider) {
          return this.execute(provider, module, [], {detect: false});
        }

        const binding = module.getBinding(val);
        if (Injector.isFunction(binding)) {
          return this.execute(binding, null);
        } else {
          return binding;
        }
      } else {
        throw new Error('Unable to satisfy dependency.', dep);
      }
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
