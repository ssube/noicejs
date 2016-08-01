import Options from './Options';

export default class Injector {
  static isConstructor(fn) {
    return fn.prototype && fn === fn.prototype.constructor;
  }

  static isFunction(fn) {
    return typeof fn === 'function';
  }

  static fromParams(params) {
    const [arg0] = args;
    if (arg0 instanceof Injector) {
      return arg0;
    } else {
      const {injector} = arg0;
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
    console.log('Injector', 'getDependencies', target, opts);
    return opts.deps.map(dep => {
      const {fn} = dep;

      // Find the first module providing a dep
      const module = this._modules.find(m => m.has(fn));
      console.log('Injector', 'getDependencies', 'search', fn, this._modules);

      if (!module) {
        throw new Error('Unable to find any implementation for interface.', fn);
      }

      // Thanks to the has check in find, one of provider
      // or binding is guaranteed to be present.
      const provider = module.getProvider(fn);
      if (provider) {
        console.log('Injector', 'getDependencies', 'provider', provider);
        return this.execute(provider, module, [], {detect: false});
      }

      const binding = module.getBinding(fn);
      console.log('Injector', 'getDependencies', 'binding', binding);
      if (Injector.isFunction(binding)) {
        console.log('Injector', 'getDependencies', 'binding', 'execute');
        return this.execute(binding, null);
      } else {
        console.log('Injector', 'getDependencies', 'binding', 'return');
        return binding;
      }
    });
  }

  execute(fn, scope, params = [], {detect = true} = {}) {
    const args = this.getDependencies(fn).concat(params);

    // if we are allowed to detect the function type and it appears to be a ctor
    if (detect && Injector.isConstructor(fn)) {
      console.log('Injector', 'execute', 'constructor', fn, args);
      return new fn(...args);
    } else {
      console.log('Injector', 'execute', 'function', fn, scope, args);
      return fn.apply(scope, args);
    }
  }

  create(ctor, ...params) {
    console.log('Injector', 'create');
    return this.execute(ctor, null, params);
  }
}
