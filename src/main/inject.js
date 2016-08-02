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
export function attachDependencies(target, flags, deps) {
  const opts = Options.getOptions(target);
  opts.merge(flags);
  opts.push(deps);
  Options.setOptions(target, opts);
}

/**
 * Define dependencies for the current class or method.
 *
 * this decorator takes each dependency (by interface) as a parameter
 * and will provide an instance of each, wrapped in an object, to the
 * constructor or function when instantiated through an Injector.
 */
export function Inject(...dependencies) {
  return function decorator(target, name) {
    attachDependencies(getConstructor(target, name), {}, dependencies);
  }
}

/**
 * Define dependencies for the current class or method.
 *
 * this decorator takes each dependency (by interface) as a parameter
 * and will provide an instance of each, wrapped in an object, to the
 * constructor or function when instantiated through an Injector.
 */
export function ObjectInject(...dependencies) {
  return function decorator(target, name) {
    attachDependencies(getConstructor(target, name), {merge: true, tagged: true}, dependencies);
  }
}

/**
 * Define dependencies for the current class or method and replace
 * it with an automatically injecting one, to support React.
 *
 * The resulting constructor or function will require an `Injector`
 * as the first parameter (or a property thereof).
 *
 * The dependencies will be merged into the first argument.
 */
export function ReactInject(...dependencies) {
  return function decorator(target, name, desc) {
    const wrapper = Wrapper.wrap(target, name, desc);
    attachDependencies(name ? wrapper.value : wrapper, {merge: true, tagged: true}, dependencies);
    return wrapper;
  }
}

/**
 * Define constructor dependencies and replace the constructor
 * with an auto-wrapping one, to support libraries like React.
 *
 * The resulting constructor will require an Injector as the
 * first parameter (or a property thereof).
 *
 * The dependencies will be merged into the first argument.
 */
export function WrapInject(...dependencies) {
  return function decorator(target, name, desc) {
    const wrapper = Wrapper.wrap(target, name, desc);
    //@TODO: make this prettier
    attachDependencies(name ? wrapper.value : wrapper, {}, dependencies);
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
