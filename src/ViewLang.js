import { View } from "./ViewIndex";
export function whiles(obj, methd, me) {
  while (obj.length) {
    var data = obj[0];
    if (methd.call(me, data, obj))
      break;
  }
}

export function each(obj, methd, arg) {
  if (!obj) return;
  arg = arg || obj;
  Object.keys(obj).every(i => {
    var data = obj[i];
    return !methd.call(data, data, i, arg);
  })
  return arg;
}

export function forEach(obj, methd, me) {
  if (!obj) return;
  if (obj.hasOwnProperty("$index")) {
    for (let i = obj.$index; i < obj.$length; i++) {
      methd.call(me, obj[i], i);
    }
  } else {
    Object.keys(obj).forEach(i => {
      methd.call(me, obj[i], i);
    })
  }
}

export function slice(obj) {
  return [].slice.call(obj);
}

export function inject(methds, parent) {
  if (methds) 
  Object.values(methds).forEach(methd => {
    let root = assign(parent);
    root.__proto__ = Function.__proto__;
    methd.__proto__ = root;
  });
}

function assign(object) {
  let obj = {};
  Object.keys(object).forEach(key => {
    obj[key] = object[key];
  });
  return obj;
}

export function extention(object, parent) {
  object.__proto__ = parent;
  return object;
}

export function extend(object, src) {
  var prototype = object.prototype || object.__proto__;
  Object.keys(src).forEach(key => {
    prototype[key] = src[key];
  });
  return object;
}

export function blank(str) {
  return str == null || str == undefined || str == "";
}

export function clone(value) {
  if (value instanceof Boolean ||
    value instanceof String ||
    value instanceof Number ||
    value instanceof Date ||
    value instanceof View) {
    return value;
  } else if (Array.isArray(value)) {
    const obj = [];
    Object.keys(value).forEach(key => {
      obj[key] = clone(value[key]);
    })
    return obj;
  }
  else if (value && typeof value === 'object') {
    const obj = {};
    Object.keys(value).forEach(key => {
      obj[key] = clone(value[key]);
    })
    return obj;
  }
  return value;
}

if (!Object.values) {
  extend(Object, {
    values(object) {
      let values = [];
      Object.keys(object).forEach(key => {
        values.push(object[key]);
      });
      return values;
    }
  });
}

extend(Array, {
  remove(n) {
    var index = this.indexOf(n);
    if (index > -1)
      this.splice(index, 1);
    return this;
  },
  replace(o, n) {
    var index = this.indexOf(o);
    if (index > -1)
      this.splice(index, 1, n);
  },
  splices(items) {
    this["splice"].apply(this, items);
  },
  has(o) {
    var index = this.indexOf(o);
    if (index > -1)
      return true;
    return false
  },
  ones(o) {
    if (this.has(o)) return;
    this.push(o);
  }
});

