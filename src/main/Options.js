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

  push(deps) {
    this._deps = this._deps.concat(deps.map(it => {
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
