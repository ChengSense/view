import { global } from "./ViewIndex";

export function observer(target, watcher, we) {
  return new Proxy(target, handler(watcher, we));
}

function handler(watcher, we, root) {
  let values = new Map(), caches = new Map();
  return {
    get(parent, prop, proxy) {
      if (prop == "$target") return parent;
      let value = values.get(prop);
      let path = root ? `${root}.${prop}` : prop;
      global.cache.delete(root);
      global.cache.set(path, caches.get(prop));
      if (value != undefined) return value;
      value = Reflect.get(parent, prop);
      if (typeof value == "object") value = new Proxy(value, handler(watcher, we, path));
      values.set(prop, value);
      caches.set(prop, new Map());
      global.cache.delete(root);
      global.cache.set(path, caches.get(prop));
      watcher.get(path);
      return value;
    },
    set(parent, prop, val, proxy) {
      let oldValue = values.get(prop)
      let oldCache = caches.get(prop);
      values.delete(prop);
      caches.delete(prop);
      Reflect.set(parent, prop, val.$target || val);
      let path = root ? `${root}.${prop}` : prop;
      watcher.set(oldCache, we);
      return true;
    }
  }
}