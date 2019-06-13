import { $expres, $express } from "./ViewExpress";
import { global } from "./ViewIndex";

export function code(_express, _scope) {
  try {
    global.$path = undefined;
    global.$cache = new Map();
    _express = _express.replace($express, "$1");
    return Code(_express)(_scope);
  } catch (e) {
    return undefined;
  }
}

export function codex(_express, _scope, we) {
  try {
    global.$path = undefined;
    global.$cache = new Map();
    _express = `'${_express.replace($expres, "'+($1)+'")}'`;
    return codec(_express, _scope, we);
  } catch (e) {
    return undefined;
  }
}

function codec(_express, _scope, we) {
  try {
    let methd = Object.assign({ $view: we.view, $methd: we.methd }, we.methd);
    Reflect.setPrototypeOf(methd, _scope);
    return Code(_express)(methd);
  } catch (e) {
    return undefined;
  }
}

export function Code(_express) {
  return new Function('_scope',
    `with (_scope) {
       return ${_express};
    }`
  );
}

export function Path(path) {
  try {
    return path.replace(/(\w+)\.?/g, "['$1']");
  } catch (e) {
    return undefined;
  }
}

export function setVariable(scope, variable, path) {
  path = `${Path(path)}`
  Object.defineProperty(scope, variable, {
    get() {
      return new Function('scope',
        `
        return scope${path};
        `
      )(scope);
    },
    set(val) {
      new Function('scope', 'val',
        `
        scope${path}=val;
        `
      )(scope, val);
    }
  });
}

export function handler(proto) {
  return {
    get(parent, prop, proxy) {
      if (prop == "$target") return parent;
      if (parent.hasOwnProperty(prop)) return Reflect.get(parent, prop);
      return Reflect.get(proto, prop);
    },
    set(parent, prop, val, proxy) {
      if (proto.hasOwnProperty(prop)) return Reflect.set(proto, prop, val);
      return Reflect.set(parent, prop, val);
    }
  }
}
