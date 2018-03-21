export function each(obj, arg, callback) {
  if (!obj) return;
  var methd = arguments[2] || arguments[1];
  var args = arguments[2] ? arg : obj;
  if (Array.isArray(obj)) {
    var length = obj.length;
    for (var i = 0; i < length; i++) {
      if (obj.length != length) {
        i = i - length + obj.length; length = obj.length;
      }
      if (obj.hasOwnProperty(i)) {
        var data = obj[i];
        if (methd.call(data, data, i, args))
          break;
      }
    }
  } else {
    for (var i in obj)
      if (obj.hasOwnProperty(i)) {
        var data = obj[i];
        if (methd.call(data, data, i, args))
          break;
      }
  }
  return args;
}

export function slice(obj) {
  return each(obj, [], function (node, i, list) {
    list.push(this);
  });
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
    return value.map(clone)
  } else if (value && typeof value === 'object') {
    const res = {}
    for (const key in value) {
      res[key] = clone(value[key])
    }
    return res
  } else {
    return value
  }
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

