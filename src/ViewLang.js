export function whiles(list, method, me) {
  while (list.length) {
    if (method.call(me, list.shift(), list))
      break;
  }
}

export function each(obj, method, arg) {
  if (!obj) return;
  arg = arg || obj;
  Object.keys(obj).every(i => {
    var data = obj[i];
    return !method.call(data, data, i, arg);
  })
  return arg;
}

export function forEach(obj, method, me) {
  if (!obj) return;
  if (obj.hasOwnProperty("$index")) {
    for (let i = obj.$index; i < obj.length; i++) {
      method.call(me, obj[i], i);
    }
  } else {
    Object.keys(obj).forEach(i => {
      method.call(me, obj[i], i);
    })
  }
}

export function farEach(obj, method, me) {
  Object.keys(obj).every(i => {
    return !method.call(me, obj[i], obj);
  })
}

export function slice(obj) {
  return [].slice.call(obj);
}

export function blank(str) {
  return str == null || str == undefined || str == "";
}

Object.assign(Array.prototype, {
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
    this.splice.apply(this, items);
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
