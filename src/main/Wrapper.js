import Injector from './Injector';

const noop = function () { /* noop */ };

export default class Wrapper {
  /**
   * Create a wrapper class to allow transparent injection.
   *
   * @TODO: add an option to allow passthrough (create an instance of the
   *        original class with the right params)
   */
  static wrapClass(target, {hook = noop} = {}) {
    return class wrapper extends target {
      static get wrappedClass() {
        return target;
      }

      constructor(...args) {
        const injector = Injector.fromParams(args);
        hook(target, args, injector);
        super(injector.getDependencies(wrapper).concat(args));
      }
    }
  }

  static wrapMethod(target, {hook = noop} = {}) {
    return function wrapper(...args) {
      const injector = Injector.fromParams(args);
      hook(target, args, injector);
      return injector.execute(target, this, args, {detect: false});
    }
  }

  static wrap(target, name, options) {
    if (name) {
      return Wrapper.wrapMethod(target[name], options);
    } else {
      return Wrapper.wrapClass(target, options);
    }
  }
}
