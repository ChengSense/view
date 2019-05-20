import { global, View } from "./ViewIndex";
import { cacher } from "./ViewResolver";
import { Path } from "./ViewScope";

export function observer(target, callSet, callGet) {

  function watcher(object, root) {
    if (typeof object == "object") {
      Object.keys(object).forEach(prop => {
        define(object, prop, root);
      })
    }
  }

  function define(object, prop, root) {
    var path = root ? `${root}.${prop}` : prop;
    var value, values = object[prop], cache = new Map();
    Object.defineProperty(object, prop, {
      get() {
        value = getValue(value, values, path);
        global.$cache = cache;
        mq.publish(target, "get", [path]);
        return value;
      },
      set(val) {
        values = val;
        value = undefined;
        var oldCache = cache;
        cache = new Map();
        mq.publish(target, "set", [oldCache, cache]);
      }
    });
  }

  function getValue(value, values, path) {
    if (value == undefined) {
      value = values;
      if (Array.isArray(value)) array(value, path);
      watcher(value, path);
    }
    return value;
  }

  function setValue(object, oldObject) {
    if (typeof object == "object") {
      Object.keys(object).forEach(prop => {
        var value = object[prop];
        var cache = global.$cache;
        var oldValue = oldObject[prop];
        var oldCache = global.$cache;
        if (oldValue == undefined) {

        }
        setValue(value, oldValue);
      })
    }
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
              cacher(getCache(), this);
              return data;
            }
          });
          break;
        case "pop":
          Object.defineProperty(object, name, {
            writable: true,
            value: function () {
              var data = method.apply(this, arguments);
              cacher(getCache(), this);
              return data;
            }
          });
          break;
        case "splice":
          Object.defineProperty(object, name, {
            writable: true,
            value: function (i, l) {
              if (0 < this.length) {
                let length = this.length;
                var data = method.apply(this, arguments);
                if (arguments.length > 2) {
                  var index = this.$index = length;
                  this.$length = this.length;
                  while (index < this.$length) define(this, index++, root);
                }
                cacher(getCache(), this, arguments.length - 2);
                delete this.$index; delete this.$length;
                return data;
              }
            }
          });
          break;
        case "unshift":
          Object.defineProperty(object, name, {
            writable: true,
            value: function (i, l) {
              if (0 < this.length) {
                let length = this.length;
                var data = method.apply(this, arguments);
                var index = this.$index = length;
                this.$length = this.length;
                while (index < this.$length) define(this, index++, root);
                cacher(getCache(), this, arguments.length);
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
              while (index < this.length) define(this, index++, root);
              cacher(getCache(), this, 1);
              delete this.$index; delete this.$length;
              return data;
            }
          });
          break;
        case "reverse":
          Object.defineProperty(object, name, {
            writable: true,
            value: function (i) {
              var data = method.apply(this, arguments);
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