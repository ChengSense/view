export function whiles(list, method) {
  while (list.length) {
    if (method(list.shift()))
      break;
  }
}

export function forEach(obj, method) {
  if (!obj) return;
  if (obj.hasOwnProperty("$index")) {
    for (let i = obj.$index; i < obj.length; i++) {
      method(obj[i], i);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((value, i) =>
      method(value, i)
    )
  } else {
    Object.keys(obj).forEach(i =>
      method(obj[i], i)
    )
  }
}

export function farEach(list, method) {
  list.every((value, i) =>
    !method(value, i)
  )
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
