/**
 * Define constructor dependencies for the current class.
 *
 * This decorator takes each dependency (by interface) as a parameter
 * and will provide an instance of each to the decorated class' constructor,
 * when instantiated through an Injector.
 */
export function Inject(...dependencies) {
  return function decorator(target, name) {
    if (name) {
      target[name].dependencies = dependencies;
    } else {
      target.dependencies = dependencies;
    }
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

  configure() {
    throw new Error('Configure has not been implemented for module!');
  }

  getClass() {
    return this.constructor;
  }

  getBinding(iface) {
    return this._bindings.get(iface);
  }

  getProvider(iface) {
    const clazz = this.getClass();
    if (clazz.providers && clazz.providers.has(iface)) {
      return clazz.providers.get(iface);
    } else {
      return null;
    }
  }

  has(iface) {
    const clazz = this.getClass();
    return this._bindings.has(iface) || (clazz.providers && clazz.providers.has(iface));
  }
}

export class Injector {
  static isConstructor(fn) {
    return fn.prototype && fn === fn.prototype.constructor;
  }

  constructor(...modules) {
    this._modules = modules.map(module => (module.configure(), module));
  }

  get modules() {
    return this._modules;
  }

  getDependencies(dependencies) {
    return dependencies.map(dep => {
      // Find the first module providing a dep
      const module = this._modules.find(m => m.has(dep));

      if (module) {
        const provider = module.getProvider(dep);
        if (provider) {
          if (provider.dependencies) {
            const deps = this.getDependencies(provider.dependencies);
            return provider.apply(module, deps);
          } else {
            return provider.call(module);
          }
        }

        const binding = module.getBinding(dep);
        if (binding) {
          if (Injector.isConstructor(binding)) {
            return this.create(binding);
          } else {
            return binding;
          }
        }
      } else {
        throw new Error('Unable to find any implementation for interface.', dep);
      }
    });
  }

  create(ctor, ...params) {
    const deps = ctor.dependencies ? this.getDependencies(ctor.dependencies) : [];
    const args = deps.concat(params);

    return new ctor(...args);
  }
}
