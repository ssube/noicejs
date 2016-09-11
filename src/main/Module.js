export default class Module {
  constructor() {
    const clazz = this.getClass();
    const entries = clazz._providers ? clazz._providers.entries() : undefined;

    this._bindings = new Map();
    this._providers = new Map(entries);
  }

  get bindings() {
    return this._bindings;
  }

  bind(iface, impl) {
    if (impl) {
      this._bindings.set(iface, impl);
      return this;
    } else {
      return {
        to: (dimpl) => {
          this._bindings.set(iface, dimpl);
          return this;
        }
      };
    }
  }

  provide(iface, impl) {
    if (impl) {
      const clazz = this.getClass();
      clazz._providers.set(iface, impl);
    } else {
      return {
        with: (fn) => {
          this._providers.set(iface, fn);
          return this;
        }
      }
    }
  }

  configure() {
    throw new Error('Configure has not been implemented by this module!');
  }

  getClass() {
    return this.constructor;
  }

  getBinding(iface) {
    return this._bindings.get(iface);
  }

  getProvider(iface) {
    if (this._providers.has(iface)) {
      return this._providers.get(iface);
    } else {
      return null;
    }
  }

  has(iface) {
    const clazz = this.getClass();
    return this._bindings.has(iface) || this._providers.has(iface);
  }
}
