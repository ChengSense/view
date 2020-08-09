import { Render, React } from "./ViewResolver";

export function ReactCode(express) {
  return new Function('React',
    `return ${express};`
  )(React);
}

export function RenderCode(express, we) {
  window.we = we;
  return new Function('we', 'React', 'Render',
    `return ${express};
    `
  )(we, React, Render);
}

export function ReactScope(_express) {
  if (!_express) return;
  let express, c;
  _express.split("").reduce(function (a, b) {
    if (!express && a.match(/\w/)) {
      express = "_scope.".concat(a);
    }
    if (c == "'" && a == "'") {
      c = null;
      express = express.concat(b);
      return b;
    }
    else if (c == "'") {
      express = express.concat(b);
      return b;
    }
    else if (a == "'") {
      c = a;
      express = express.concat(b);
      return b;
    }
    else if (a.match(/\W/) && !a.match(/\.|\$|_/) && b.match(/\w/) && !b.match(/\d/)) {
      express = express.concat("_scope.").concat(b);
      return b;
    }
    else {
      express = express.concat(b);
      return b;
    }
  });
  return express;
}

export function handler(proto, scope, field, key) {
  return {
    get(parent, prop) {
      if (field == prop) return Reflect.get(scope, key);
      if (`${field}$` == prop) return Reflect.get(scope, `${key}$`);
      if (prop == "$target") return parent;
      if (parent.hasOwnProperty(prop)) return Reflect.get(parent, prop);
      return Reflect.get(proto, prop);
    },
    set(parent, prop, val) {
      if (field == prop) return Reflect.set(scope, key, val);
      if (parent.hasOwnProperty(prop)) return Reflect.set(parent, prop, val);
      return Reflect.set(proto, prop, val);
    }
  }
}