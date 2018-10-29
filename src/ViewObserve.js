import { Path } from "./ViewScope";
import { View, global, deepen } from "./ViewIndex";

export function observe(target, callSet, callGet) {
  var setable = true;
  function watcher(object, root, oldObject) {
    if (Array.isArray(object)) {
      array(object, root);
      object.forEach((a, prop) => {
        walk(object, prop, root, oldObject);
      })
    } else if (typeof object == "object") {
      Object.keys(object).forEach(prop => {
        walk(object, prop, root, oldObject);
      })
    }
  }

  function walk(object, prop, root, oldObject) {
    var value = object[prop], oldValue = (oldObject || {})[prop];
    var path = root ? root + "." + prop : prop;
    if (!(value instanceof View) && typeof value == "object") {
      watcher(value, path, oldValue);
    }
    define(object, prop, path, oldValue);
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
        clearCache(oldValue);
        if (setable) deepen(oldCache);
      }
    });
  }

  function clearCache(object) {
    if (typeof object == "object" && !(object instanceof View))
      setTimeout(() => {
        Object.keys(object).forEach(prop => {
          var value = object[prop];
          let cache = global.$cache;
          deepen(cache);
          cache.forEach(nodes => clearNodes(nodes));
          clearCache(value);
        })
      }, 500);
  }

  function clearNodes(childNodes) {
    childNodes.forEach(function (clas) {
      if (clas.path)
        clas.path.forEach(path => {
          getValue(path);
          global.$cache.forEach(nodes => nodes.remove(clas));
        })
      if (clas.childNodes[0])
        clearNodes(clas.childNodes);
    });
  }

  function getValue(path) {
    return new Function('scope',
      `
      return scope${Path(path)};
      `
    )(target);
  }

  function def(obj, key, val) {
    Object.defineProperty(obj, key, {
      writable: true,
      value: val
    });
  }

  function array(object, root) {
    const meths = ["shift", "push", "pop", "splice", "unshift", "reverse"];
    var prototype = Array.prototype;
    meths.forEach(function (name) {
      var method = prototype[name];
      switch (name) {
        case "shift":
          def(object, name, function () {
            setable = false;
            var data = method.apply(this, arguments);
            setable = true;
            notify([0]);
            return data;
          });
          break;
        case "pop":
          def(object, name, function () {
            var data = method.apply(this, arguments);
            notify([this.length]);
            return data;
          });
          break;
        case "splice":
          def(object, name, function (i, l) {
            setable = false;
            var data = method.apply(this, arguments);
            var params = [], m = new Number(i) + new Number(l);
            while (i < m) params.push(i++);
            setable = true;
            notify(params);
            return data;
          });
          break;
        case "push":
          def(object, name, function (i) {
            var data = method.call(this, i);
            notify([]);
            return data;
          });
          break;
        default:
          def(object, name, function () {
            setable = false;
            var data = method.apply(this, arguments);
            notify([]);
            return data;
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