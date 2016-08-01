export default class Module {
  constructor() {
    this._bindings = new Map();
  }

  get bindings() {
    return this._bindings;
  }

  bind(iface) {
    return {
      to: (impl) => {
        this._bindings.set(iface, impl);
      }
    };
  }

  configure() {
    throw new Error('Configure has not been implemented for module!');
  }

  getClass() {
    return this.constructor;
  }

  getBinding(iface) {
    return this._bindings.get(iface);
  }

  getProvider(iface) {
    const clazz = this.getClass();
    if (clazz.providers && clazz.providers.has(iface)) {
      return clazz.providers.get(iface);
    } else {
      return null;
    }
  }

  has(iface) {
    const clazz = this.getClass();
    return this._bindings.has(iface) || (clazz.providers && clazz.providers.has(iface));
  }
}
