import { cacher } from "./ViewResolver";

export function observer(target, call) {
  if (typeof target != 'object') return target;
  target = new Proxy(target, handler());

  function handler(root) {
    let values = new Map(), caches = new Map();
    return {
      get(parent, prop, proxy) {
        if (prop == "$target") return parent;
        if (new String(prop).endsWith("$")) {
          let cache = caches.get(prop);
          if (cache != undefined) return cache;
          return Reflect.get(parent, prop);
        } else {
          if (!parent.hasOwnProperty(prop) && Reflect.has(parent, prop)) return Reflect.get(parent, prop);
          let path = root ? `${root}.${prop}` : prop;
          mq.publish(target, "get", [path]);
          let value = values.get(prop);
          if (value != undefined) return value;
          value = Reflect.get(parent, prop);
          if (check(value)) value = new Proxy(value, handler(path));
          values.set(prop, value);
          caches.set(`${prop}$`, new Map());
          array(value, caches.get(`${prop}$`));
          return value;
        }
      },
      set(parent, prop, val, proxy) {
        if (!parent.hasOwnProperty(prop) && Reflect.has(parent, prop)) return Reflect.set(parent, prop, val);
        let oldValue = values.get(prop)
        let oldCache = caches.get(`${prop}$`);
        values.delete(prop);
        caches.delete(`${prop}$`);
        Reflect.set(parent, prop, val.$target || val);
        let value = proxy[prop];
        setValue(value, oldValue);
        mq.publish(target, "set", [oldCache, caches.get(`${prop}$`)]);
        return true;
      }
    }
  }

  function setValue(object, oldObject) {
    if (object instanceof Component) return;
    if (typeof object == "object" && typeof oldObject == "object") {
      Object.keys(oldObject).forEach(prop => {
        let value = object[prop], cache = object[`${prop}$`];
        let oldValue = oldObject[prop], oldCache = oldObject[`${prop}$`];
        if (typeof value != "object" && typeof oldValue != "object") mq.publish(target, "set", [oldCache, cache]);
        setValue(value, oldValue);
      });
    }
  }

  function check(value) {
    if (value instanceof Component) return;
    if (value instanceof Date) return;
    if (typeof value == "object") return value;
  }

  Object.keys(call).forEach(key => mq.subscribe(target, key, call[key]));
  return target;
}

function array(object, cache) {
  if (!Array.isArray(object)) return;
  let methods = {
    shift() {
      var method = Array.prototype.shift;
      let data = method.apply(this, arguments);
      let index = this.length;
      cacher(cache, index);
      return data;
    },
    pop() {
      var method = Array.prototype.pop;
      let data = method.apply(this, arguments);
      let index = this.length;
      cacher(cache, index);
      return data;
    },
    splice() {
      var method = Array.prototype.splice;
      if (this.length) {
        let index = this.length;
        let data = method.apply(this, arguments);
        arguments.length > 2 ? this.$index = index : index = this.length;
        cacher(cache, index, arguments.length - 2);
        Reflect.deleteProperty(this, "$index");
        return data;
      }
    },
    unshift() {
      var method = Array.prototype.unshift;
      if (arguments.length) {
        let index = this.$index = this.length;
        let data = method.apply(this, arguments);
        cacher(cache, index, arguments.length);
        Reflect.deleteProperty(this, "$index");
        return data;
      }
    },
    push() {
      var method = Array.prototype.push;
      if (arguments.length) {
        let index = this.$index = this.length;
        let data = method.apply(this, arguments);
        cacher(cache, index, arguments.length);
        Reflect.deleteProperty(this, "$index");
        return data;
      }
    },
    reverse() {
      var method = Array.prototype.reverse;
      let data = method.apply(this, arguments);
      return data;
    },
    sort() {
      var method = Array.prototype.sort;
      let data = method.apply(this, arguments);
      return data;
    }
  }
  Reflect.setPrototypeOf(methods, Array.prototype);
  Reflect.setPrototypeOf(object, methods);
}

class Mess {
  constructor() {
    this.map = new Map();
  }
  publish(scope, event, data) {
    const cache = this.map.get(scope);
    if (cache) {
      let action = cache.get(event);
      if (action) {
        action.data.push(data);
      }
      else {
        cache.set(event, { data: [data], queue: [] });
      }
    }
    else {
      let data = new Map();
      data.set(event, { data: [data], queue: [] });
      this.map.set(scope, data);
    }
    this.notify(cache.get(event), scope);
  }

  notify(action, scope) {
    if (action) {
      while (action.data.length) {
        const data = action.data.shift();
        action.queue.forEach(function (call) {
          call.apply(scope, data);
        });
      }
    }
    else {
      this.map.forEach(function (cache) {
        cache.forEach(function (action) {
          while (action.data.length) {
            const data = action.data.shift();
            action.queue.forEach(function (call) {
              call.apply(scope, data);
            })
          }
        });
      });
    }
  }

  subscribe(scope, event, call) {
    const cache = this.map.get(scope);
    if (cache) {
      const action = cache.get(event);
      if (action) {
        action.queue.push(call);
      }
      else {
        cache.set(event, { data: [], queue: [call] });
      }
    }
    else {
      let data = new Map();
      data.set(event, { data: [], queue: [call] });
      this.map.set(scope, data);
    }
  }
}

export var mq = new Mess();