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
  constructor() {
    this._bindings = new Map();
  }

  bind(iface) {
    return {
      to: (impl) => {
        this._bindings.set(iface, impl);
      }
    };
  }

  getClass() {
    return this.prototype.constructor;
  }

  isConstructor(fn) {
    return fn === fn.prototype.constructor;
  }

  has(iface) {
    return this._bindings.has(iface) || this.getClass().providers.has(iface);
  }

  get(iface, inj) {
    const clazz = this.getClass();
    if (this._bindings.has(iface)) {
      const impl = this._bindings.get(iface);
      if (this.isConstructor(impl)) {
        return inj.create(impl);
      } else {
        return impl;
      }
    } else if (clazz.providers.has(iface)) {
      const method = clazz.providers.get(iface);
      return method.call(this);
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
    this._modules = modules;
  }

  create(ctor, ...params) {
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
