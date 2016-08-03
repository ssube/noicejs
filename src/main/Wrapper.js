import Injector from './Injector';

export const injectorHook = function (target, wrapper, args) {
  return Injector.fromParams(args).getDependencies(wrapper).concat(args)
};

export default class Wrapper {
  /**
   * Create a wrapper class to allow transparent injection.
   *
   * @TODO: add an option to allow passthrough (create an instance of the
   *        original class with the right params)
   */
  static wrapClass(target, {hook = injectorHook}) {
    return class wrapper extends target {
      static get wrappedClass() {
        return target;
      }

      constructor(...args) {
        super(...hook(target, wrapper, args));
      }
    }
  }

  static wrapMethod(target, desc, {hook = injectorHook}) {
    desc.value = function wrapper(...args) {
      return target.apply(this, hook(target, wrapper, args));
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
