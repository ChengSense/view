import { $expres, $express } from "./ViewExpress";
import { global } from "./ViewIndex";

export function code(_express, _scope) {
  try {
    global.$path = undefined;
    global.$cache = new Map();
    _express = _express.replace($express, "$1");
    return Code(_express)(_scope);
  } catch (error) {
    console.warn(error)
    return undefined;
  }
}

export function codex(_express, _scope, we) {
  try {
    global.$path = undefined;
    global.$cache = new Map();
    _express = `'${_express.replace($expres, "'+($1)+'")}'`;
    return codec(_express, _scope, we);
  } catch (error) {
    console.warn(error)
    return undefined;
  }
}

export function codeo(_express, _scope, we) {
  try {
    global.$path = undefined;
    global.$cache = new Map();
    _express = _express.replace($express, "$1");
    return codec(_express, _scope, we);
  } catch (error) {
    console.warn(error)
    return undefined;
  }
}

function codec(_express, _scope, we) {
  try {
    let filter = Reflect.getPrototypeOf(we.filter);
    Reflect.setPrototypeOf(filter, _scope);
    return Code(_express)(we.filter);
  } catch (error) {
    console.warn(error)
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
  } catch (error) {
    console.warn(error)
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
      if (parent.hasOwnProperty(prop)) return Reflect.set(parent, prop, val);
      return Reflect.set(proto, prop, val);
    }
  }
}

export function setScopes(we) {
  let action = { $view: we.view, $model: we.model, $action: we.action, $watch: we.watch };
  we.action = we.action || {};
  Reflect.setPrototypeOf(action, Function.prototype);
  Object.values(we.action).forEach(method => Reflect.setPrototypeOf(method, action));

  let filter = Object.assign({}, action);
  we.filter = we.filter || {};
  Reflect.setPrototypeOf(we.filter, filter);
}
