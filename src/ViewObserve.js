import { global, View } from "./ViewIndex";
import { cacher } from "./ViewResolver";
import { Path } from "./ViewScope";

export function observe(target, callSet, callGet) {

  function watcher(object, root, oldObject) {
    if (object instanceof View) return;
    if (typeof object == "object") {
      if (Array.isArray(object)) array(object, root);
      Object.keys(object).forEach(prop => {
        walk(object, prop, root, oldObject);
      })
    }
  }

  function walk(object, prop, root, oldObject) {
    var value = object[prop], oldValue;
    if (oldObject != undefined) oldValue = oldObject[prop];
    var path = root ? `${root}.${prop}` : prop;
    if (value instanceof View) {
      define(object, prop, path, oldValue);
    }
    else if (typeof value == "object") {
      watcher(value, path, oldValue);
      define(object, prop, path, oldValue);
    }
    else {
      define(object, prop, path, oldValue);
    }
  }

  function define(object, prop, path, oldValue) {
    var value = object[prop], cache = new Map();
    Object.defineProperty(object, prop, {
      get() {
        mq.publish(target, "get", [path]);
        global.$cache = cache;
        return value;
      },
      set(val) {
        var oldValue = value;
        var oldCache = cache;
        cache = new Map();
        watcher(value = val, path, oldValue);
        mq.publish(target, "set", [oldValue, oldCache, object]);
      }
    });
  }

  const meths = ["shift", "push", "pop", "splice", "unshift", "reverse"];
  function array(object, root) {
    meths.forEach(function (name) {
      var method = Array.prototype[name];
      switch (name) {
        case "shift":
          Object.defineProperty(object, name, {
            writable: true,
            value: function () {
              var data = method.apply(this, arguments);
              cacher(getCache(), 0, 1, this);
              return data;
            }
          });
          break;
        case "pop":
          Object.defineProperty(object, name, {
            writable: true,
            value: function () {
              var data = method.apply(this, arguments);
              cacher(getCache(), this.length, 1, this);
              return data;
            }
          });
          break;
        case "splice":
          Object.defineProperty(object, name, {
            writable: true,
            value: function (i, l) {
              if (0 < this.length) {
                let index = this.$index = new Number(i), length = this.length;
                var data = method.apply(this, arguments);
                if (index < length && arguments.length > 2) {
                  this.$index = index, this.$length = index + arguments.length - 2;
                  while (index < this.$length) walk(this, index++, root);
                }
                else if (arguments.length > 2) {
                  this.$index = index = length, this.$length = this.length;
                  while (index < this.$length) walk(this, index++, root);
                }
                cacher(getCache(), this.$index, l, this, arguments.length > 2);
                delete this.$index; delete this.$length;
                return data;
              }
            }
          });
          break;
        case "push":
          Object.defineProperty(object, name, {
            writable: true,
            value: function (i) {
              let index = this.length;
              var data = method.call(this, i);
              this.$index = index, this.$length = this.length;
              while (index < this.length) walk(this, index++, root);
              cacher(getCache(), this.$index, 0, this, true);
              delete this.$index; delete this.$length;
              return data;
            }
          });
          break;
        default:
          Object.defineProperty(object, name, {
            writable: true,
            value: function () {
              var data = method.apply(this, arguments);
              notify([]);
              return data;
            }
          });
          break;
      }
    });
    function notify(parm) {
      new Function('scope', 'val',
        `
        scope${Path(root)}=val;
        `
      )(target, object);
    }
    function getCache() {
      new Function('scope',
        `
        return scope${Path(root)};
        `
      )(target)
      return global.$cache;
    }
  }

  mq.subscribe(target, "set", callSet);
  mq.subscribe(target, "get", callGet);

  watcher(target);
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
      } else {
        cache.set(event, { data: [data], queue: [] });
      }
    } else {
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
    } else {
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
      } else {
        cache.set(event, { data: [], queue: [call] });
      }
    } else {
      let data = new Map();
      data.set(event, { data: [], queue: [call] });
      this.map.set(scope, data);
    }
  }
}

var mq = new Mess();