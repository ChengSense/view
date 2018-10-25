export function whiles(obj, methd) {
  while (obj.length) {
    var data = obj[0];
    if (methd.call(data, data, obj))
      break;
  }
}

export function each(obj, methd, arg) {
  if (!obj) return;
  arg = arg || obj;
  if (Array.isArray(obj)) {
    var length = obj.length;
    for (var i = 0; i < length; i++) {
      if (obj.hasOwnProperty(i)) {
        var data = obj[i];
        if (methd.call(data, data, i, arg))
          break;
      }
    }
  } else {
    for (var i in obj)
      if (obj.hasOwnProperty(i)) {
        var data = obj[i];
        if (methd.call(data, data, i, arg))
          break;
      }
  }
  return arg;
}

export function forEach(obj, methd) {
  if (Array.isArray(obj)) {
    var length = obj.length;
    for (var i = 0; i < length; i++) {
      if (obj.hasOwnProperty(i)) {
        methd(obj[i], i);
      }
    }
  } else {
    for (var i in obj)
      if (obj.hasOwnProperty(i)) {
        methd(obj[i], i);
      }
  }
}

export function slice(obj) {
  let list = [];
  forEach(obj, function (node) {
    list.push(node);
  });
  return list;
}

export function extention(object, parent) {
  object.__proto__ = parent;
  return object;
}

export function extend(object, src) {
  var prototype = object.prototype || object.__proto__;
  for (var key in src) {
    prototype[key] = src[key];
  }
  return object;
}

export function blank(str) {
  return str == null || str == undefined || str == "";
}

export function clone(value) {
  if (Array.isArray(value)) {
    return value.map(clone);
  }
  if (value && typeof value === 'object') {
    const obj = {};
    for (const key in value) {
      obj[key] = clone(value[key]);
    }
    return obj;
  }
  return value;
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
  has(o) {
    var index = this.indexOf(o);
    if (index > -1)
      return true;
    return false
  }
});

