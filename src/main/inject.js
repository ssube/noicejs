// Basic underlying functions

import Injector from './Injector';
import Module from './Module';
import Options from './Options';
import Wrapper from './Wrapper';

export {Injector, Module, Options, Wrapper};

function getConstructor(target, name) {
  return name ? target[name] : target;
}

/**
 * Attach a list of dependencies to the target constructor or prototype.
 *
 * If the `name` parameter is truthy, we're dealing with a method rather
 * than a class. If this is on a method, then `target` is the prototype.
 * If this is on a class, then `target` is the constructor.
 */
export function attachDependencies(target, deps) {
  Options.setOptions(target, Options.getOptions(target).push(deps));
}

/**
 * Define constructor dependencies for the current class.
 *
 * This decorator takes each dependency (by interface) as a parameter
 * and will provide an instance of each to the decorated class' constructor,
 * when instantiated through an Injector.
 */
export function Inject(...dependencies) {
  return function decorator(target, name) {
    attachDependencies(getConstructor(target, name), dependencies);
  }
}

/**
 * Define constructor dependencies and replace the constructor
 * with an auto-wrapping one, to support libraries like React.
 *
 * The resulting constructor will require an Injector as the
 * first parameter (or a property thereof).
 */
export function WrapInject(options, ...dependencies) {
  return function decorator(target, name, desc) {
    const wrapper = Wrapper.wrap(target, name, desc, options);
    //@TODO: make this prettier
    attachDependencies(name ? wrapper.value : wrapper, dependencies);
    return wrapper;
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
