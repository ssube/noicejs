import Injector from './Injector';

export const injectorHook = function (target, wrapper, args) {
  return Injector.fromParams(args).getDependencies(wrapper).concat(args)
};

export default class Wrapper {
  /**
   * Create a wrapper class to allow transparent injection.
   *
   * If options are provided and a `hook` is specified, it will be called
   * with the target and arguments before the wrapped class is invoked, and
   * may modify the parameters on the way (typically adding by dependencies).
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

  /**
   * Create a wrapper method to allow transparent injection.
   *
   * If options are provided and a `hook` is specified, it will be called
   * with the target and arguments before the wrapped class is invoked, and
   * may modify the parameters on the way (typically by adding dependencies).
   */
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
