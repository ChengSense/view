import { $expres, $express } from "./ViewExpress";
import { global } from "./ViewIndex";
import { extention } from "./ViewLang";
import { watcher } from "./ViewWatcher";

export function codec(_express, _scope, we) {
  try {
    global.$path = undefined;
    global.$cache = undefined;
    _express = _express.replace($express, "$1");
    let value = codecc(_express, _scope, we);
    if (value) return value;
    value = Code(_express)(we.flux);
    if (value) return value;
    return Code(_express)(we.components);
  } catch (e) {
    return undefined;
  }
}

function codecc(_express, _scope, we) {
  try {
    let express = _express.split(":"), value;
    if (express.length < 2) return;
    value = Codex(express[0], extention({ flux: we.flux }, _scope));
    if (value) return value;
    let props = express[0].replace("flux", "");
    let comp = express[1];
    return codeccc(props, comp, _scope, we)
  } catch (e) {
    return undefined;
  }
}

function codeccc(props, comp, scope, we) {
  try {
    let value = we.flux;
    let expres = props.match(/(\w+)/g);
    let prop = scope[expres.pop()];
    expres.forEach(prop => value = value[scope[prop]] || (value[scope[prop]] = {}));
    value[prop] = we.components[comp];
    watcher(we.flux, value, prop);
    return value[prop];
  } catch (e) {
    return undefined;
  }
}

export function code(_express, _scope) {
  try {
    global.$path = undefined;
    global.$cache = undefined;
    return Code(_express)(_scope);
  } catch (e) {
    return undefined;
  }
}

export function codex(_express, _scope) {
  try {
    _express = `'${_express.replace($expres, "'+($1)+'")}'`;
    return Code(_express)(_scope);
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

function Codex(_express, _scope) {
  try {
    return Code(_express)(_scope);
  } catch (error) {
    return undefined;
  }
}

export function codev(_express, _scope, _event) {
  var array = _express.toString().match(/\(([^)]*)\)/);
  if (array) {
    var name = _express.toString().replace(array[0], "");
    var args = code(`[${array[1]}]`, _scope);
    args.push(_event);
    code(name, _scope.$action).apply(_scope, args);
  }
  else {
    var args = [_event];
    code(_express, _scope.$action).apply(_scope, args);
  }
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
