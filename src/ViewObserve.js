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
    if (Array.isArray(value)) array(value, path);
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

  const meths = ["shift", "push", "pop", "splice", "unshift", "reverse", "sort"];
  function array(object, root) {
    meths.forEach(function (name) {
      var method = Array.prototype[name];
      switch (name) {
        case "shift":
          Object.defineProperty(object, name, {
            writable: true,
            value: function () {
              let data = method.apply(this, arguments);
              let index = this.length;
              cacher(getCache(), index);
              return data;
            }
          });
          break;
        case "pop":
          Object.defineProperty(object, name, {
            writable: true,
            value: function () {
              let data = method.apply(this, arguments);
              let index = this.length;
              cacher(getCache(), index);
              return data;
            }
          });
          break;
        case "splice":
          Object.defineProperty(object, name, {
            writable: true,
            value: function () {
              if (this.length) {
                let index = this.length;
                let data = method.apply(this, arguments);
                arguments.length > 2 ? this.$index = index : index = this.length;
                cacher(getCache(), index, arguments.length - 2);
                Reflect.deleteProperty(this, "$index");
                return data;
              }
            }
          });
          break;
        case "unshift":
          Object.defineProperty(object, name, {
            writable: true,
            value: function () {
              if (arguments.length) {
                let index = this.$index = this.length;
                let data = method.apply(this, arguments);
                cacher(getCache(), index, arguments.length);
                Reflect.deleteProperty(this, "$index");
                return data;
              }
            }
          });
          break;
        case "push":
          Object.defineProperty(object, name, {
            writable: true,
            value: function () {
              if (arguments.length) {
                let index = this.$index = this.length;
                let data = method.apply(this, arguments);
                cacher(getCache(), index, arguments.length);
                Reflect.deleteProperty(this, "$index");
                return data;
              }
            }
          });
          break;
        case "reverse":
          Object.defineProperty(object, name, {
            writable: true,
            value: function () {
              let data = method.apply(this, arguments);
              return data;
            }
          });
          break;
        case "sort":
          Object.defineProperty(object, name, {
            writable: true,
            value: function () {
              let data = method.apply(this, arguments);
              return data;
            }
          });
          break;
      }
    });

    function getCache() {
      new Function('scope',
        `
        return scope${Path(root)};
        `
      )(target)
      return global.$cache;
    }
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