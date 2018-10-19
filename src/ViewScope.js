import { $express, $expres } from "./ViewExpress";
import { global } from "./ViewIndex";

export function code(_express, _scope) {
  try {
    global.$path = undefined;
    _express = _express.replace($express, "$1");
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

export function codev(_express, _scope, _event) {
  var array = _express.toString().match(/\(([^)]*)\)/);
  var name = _express.toString().replace(array[0], "");
  var args = code(`[${array[1]}]`, _scope);
  args.push(_event);
  code(name, _scope.$action).apply(_scope, args);
}

export function Path(path) {
  try {
    return path.replace(/(\w+)\.?/g, "['$1']");
  } catch (e) {
    return undefined;
  }
}

export function setVariable(scope, variable, path) {
  Object.defineProperty(scope, variable, {
    get() {
      return new Function('scope',
        `
        return scope${Path(path)};
        `
      )(scope);
    },
    set(val) {
      new Function('scope', 'val',
        `
        scope${Path(path)}=val;
        `
      )(scope, val);
    }
  });
}
