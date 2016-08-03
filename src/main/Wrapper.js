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
        super(...Injector.fromParams(args).getDependencies(wrapper).concat(args));
      }
    }
  }

  static wrapMethod(target, desc) {
    desc.value = function wrapper(...args) {
      return Injector.fromParams(args).execute(target, this, args, {detect: false});
    };
    return desc;
  }

  static wrap(target, name, desc, options) {
    if (name) {
      return Wrapper.wrapMethod(target[name], desc, options);
    } else {
      return Wrapper.wrapClass(target, options);
    }
  }
}
