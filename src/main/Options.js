export const symbol = Symbol('noice-options');

export default class Options {
  static getOptions(fn) {
    return (fn[symbol] || new Options());
  }

  static setOptions(fn, opts) {
    return (fn[symbol] = opts);
  }

  constructor({deps = [], obj = false} = {}) {
    this._deps = deps;
    this._obj = obj;
  }

  get deps() {
    return this._deps;
  }

  /**
   * Convert an iterable of constructors (interfaces, here) into
   * an array of dependency options. Any objects will be passed
   * through unchanged, so named dependencies and the like will
   * not be modified.
   */
  push(deps) {
    this._deps.push(...deps.map(it => {
      if (typeof it === 'function') {
        return {fn: it};
      } else if (typeof it === 'string') {
        return {name: it};
      } else {
        return it;
      }
    }));
    return this;
  }

  /**
   * Combine the current options with another set
   * using `&&`.
   */
  merge(opts) {
    this._obj &= opts.obj;
  }

  get obj() {
    return this._obj;
  }
}
