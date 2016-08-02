export const symbol = Symbol('noicejs-options');

export default class Options {
  /**
   * Convert an iterable of constructors (interfaces, here) into
   * an array of dependency options. Any objects will be passed
   * through unchanged, so named dependencies and the like will
   * not be modified.
   */
  static wrap(deps) {
    return deps.map(it => {
      if (typeof it === 'function') {
        return {fn: it};
      } else if (typeof it === 'string') {
        return {name: it};
      } else {
        return it;
      }
    });
  }

  static getOptions(fn) {
    return (fn[symbol] || new Options());
  }

  static setOptions(fn, opts) {
    return (fn[symbol] = opts);
  }

  constructor({deps = []} = {}) {
    this._deps = deps;
  }

  get deps() {
    return this._deps;
  }

  push(deps) {
    this._deps.push(...Options.wrap(deps));
    return this;
  }
}
