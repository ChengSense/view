import { global } from "./ViewIndex";
import { Path } from "./ViewScope";
import { cacher } from "./ViewResolver";

export function observer(target, call) {
  if (typeof target != 'object') return target;
  target = new Proxy(target, handler());

  function handler(root) {
    let values = new Map(), cache = new Map();
    return {
      get(parent, prop, proxy) {
        if (prop == "$target") return parent;
        let method = array(proxy, prop, root);
        if (method) return method;
        if (!parent.hasOwnProperty(prop)) return parent[prop];
        let path = root ? `${root}.${prop}` : prop;
        let value = getValue(values, cache, parent, prop, path);
        global.$cache = cache.get(prop);
        mq.publish(target, "get", [path]);
        return value;
      },
      set(parent, prop, val, proxy) {
        let oldValue = values.get(prop)
        let oldCache = cache.get(prop);
        values.set(prop, undefined);
        cache.set(prop, new Map());
        Reflect.set(parent, prop, val.$target || val);
        setValue(proxy[prop], oldValue);
        let path = root ? `${root}.${prop}` : prop;
        mq.publish(target, "set", [oldCache, cache.get(prop)]);
        mq.publish(target, path, [oldValue]);
        return true;
      }
    }
  }

  function getValue(values, cache, parent, prop, path) {
    let value = values.get(prop);
    if (value != undefined) return value;
    cache.set(prop, new Map());
    value = Reflect.get(parent, prop);
    if (!(value instanceof View) && typeof value == "object") {
      value = new Proxy(value, handler(path));
    }
    values.set(prop, value);
    return value;
  }

  function setValue(object, oldObject) {
    if (typeof object == "object" && typeof oldObject == "object") {
      Object.keys(oldObject).forEach(prop => {
        let value = object[prop];
        let cache = global.$cache;
        let oldValue = oldObject[prop];
        let oldCache = global.$cache;
        if (typeof value != "object" && typeof oldValue != "object") mq.publish(target, "set", [oldCache, cache]);
        setValue(value, oldValue);
      });
    }
  }

  function array(object, name, root) {
    if (!Array.isArray(object)) return;
    const meths = {
      shift() {
        var method = Array.prototype.shift;
        let data = method.apply(this, arguments);
        if (!cacher) return data;
        let index = this.length;
        cacher(getCache(), index);
        return data;
      },
      pop() {
        var method = Array.prototype.pop;
        let data = method.apply(this, arguments);
        if (!cacher) return data;
        let index = this.length;
        cacher(getCache(), index);
        return data;
      },
      splice() {
        var method = Array.prototype.splice;
        if (this.length) {
          let index = this.length;
          let data = method.apply(this, arguments);
          if (!cacher) return data;
          arguments.length > 2 ? this.$index = index : index = this.length;
          cacher(getCache(), index, arguments.length - 2);
          Reflect.deleteProperty(this, "$index");
          return data;
        }
      },
      unshift() {
        var method = Array.prototype.unshift;
        if (arguments.length) {
          let index = this.$index = this.length;
          let data = method.apply(this, arguments);
          if (!cacher) return data;
          cacher(getCache(), index, arguments.length);
          Reflect.deleteProperty(this, "$index");
          return data;
        }
      },
      push() {
        var method = Array.prototype.push;
        if (arguments.length) {
          let index = this.$index = this.length;
          let data = method.apply(this, arguments);
          if (!cacher) return data;
          cacher(getCache(), index, arguments.length);
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
    };
    Reflect.setPrototypeOf(meths, object);
    function getCache() {
      new Function('scope',
        `
        return scope${Path(root)};
        `
      )(target);
      return global.$cache;
    }
    return meths[name];
  }

  Object.keys(call).forEach(key => {
    mq.subscribe(target, key, call[key]);
  });
  return target;
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
    this.notify(cache.get(event));
  }

  notify(action) {
    if (action) {
      while (action.data.length) {
        const data = action.data.shift();
        action.queue.forEach(function (call) {
          call(data[0], data[1], data[2]);
        });
      }
    }
    else {
      this.map.forEach(function (cache) {
        cache.forEach(function (action) {
          while (action.data.length) {
            const data = action.data.shift();
            action.queue.forEach(function (call) {
              call(data[0], data[1], data[2]);
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