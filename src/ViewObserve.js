import { global } from "./ViewIndex";

export function observer(target, watcher, we) {
  return new Proxy(target, handler(watcher, we));
}

function handler(watcher, we, root) {
  let values = new Map(), caches = new Map();
  return {
    get(parent, prop, proxy) {
      if (prop == "$target") return parent;
      if (!parent.hasOwnProperty(prop) && Reflect.has(parent, prop)) return Reflect.get(parent, prop);
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
      if (!parent.hasOwnProperty(prop) && Reflect.has(parent, prop)) return Reflect.set(parent, prop, val);
      let oldValue = values.get(prop)
      let oldCache = caches.get(prop);
      values.delete(prop);
      caches.delete(prop);
      Reflect.set(parent, prop, val.$target || val);
      let value = proxy[prop];
      setValue(value, oldValue, watcher, we);
      let path = root ? `${root}.${prop}` : prop;
      watcher.set(new Map([[path,oldCache]]), new Map([[path,caches.get(prop)]]) , we);
      return true;
    }
  }
}

function setValue(object, oldObject, watcher, we) {
  if (typeof object == "object" && typeof oldObject == "object") {
    Object.keys(oldObject).forEach(prop => {
      global.cache = new Map();
      let value = object[prop], cache = global.cache;
      global.cache = new Map();
      let oldValue = oldObject[prop], oldCache = global.cache;
      if (typeof value != "object" && typeof oldValue != "object") watcher.set(oldCache, cache, we);
      setValue(value, oldValue, watcher, we);
    });
  }
}