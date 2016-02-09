/**
 * Define constructor dependencies for the current class.
 *
 * This decorator takes each dependency (by interface) as a parameter
 * and will provide an instance of each to the decorated class' constructor,
 * when instantiated through an Injector.
 */
export function Inject(...dependencies) {
  return function decorator(target) {
    target.dependencies = dependencies;
  }
}

/**
 * Mark a module method as the factory for an interface.
 *
 * This decorator takes the interface as a parameter and
 * will register the method on the module class as being
 * the appropriate factory for the interface.
 *
 * Provider methods will be called if no binding is found.
 */
export function Provides(iface) {
  return function decorator(proto, name) {
    const target = proto.constructor;
    if (!target.providers) {
      target.providers = new Map();
    }
    target.providers.set(iface, proto[name]);
  }
}

export class Module {
  static isConstructor(fn) {
    return fn.prototype && fn === fn.prototype.constructor;
  }

  constructor() {
    this._bindings = new Map();
  }

  get bindings() {
    return this._bindings;
  }

  bind(iface) {
    return {
      to: (impl) => {
        this._bindings.set(iface, impl);
      }
    };
  }

  getClass() {
    return this.constructor;
  }

  has(iface) {
    const clazz = this.getClass();
    return this._bindings.has(iface) || (clazz.providers && clazz.providers.has(iface));
  }

  get(iface, inj) {
    const clazz = this.getClass();
    if (this._bindings.has(iface)) {
      const impl = this._bindings.get(iface);
      if (Module.isConstructor(impl)) {
        return inj.create(impl);
      } else {
        return impl;
      }
    } else if (clazz.providers.has(iface)) {
      const method = clazz.providers.get(iface);
      return method.call(this, inj);
    } else {
      return null;
    }
  }

  configure() {
    throw new Error('Configure has not been implemented for module!');
  }
}

export class Injector {
  constructor(...modules) {
    this._modules = modules.map(module => (module.configure(), module));
  }

  get modules() {
    return this._modules;
  }

  create(ctor, ...params) {
    if (!ctor.dependencies) {
      throw new Error('Constructor does not list dependencies!');
    }

    const args = ctor.dependencies.map(dep => {
      // Find the first module providing a dep
      const module = this._modules.find(m => m.has(dep));
      if (module) {
        return module.get(dep, this);
      } else {
        throw new Error('Unable to find any implementation for interface.', dep);
      }
    }).concat(params);

    return new ctor(...args);
  }
}
