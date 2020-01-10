import { $expres, $express, $word } from "./ViewExpress";
import { global } from "./ViewIndex";

let codeCacher = new Map();

export function code(_express, _scope) {
  try {
    global.$path = undefined;
    _express = _express.replace($express, "$1");
    return Code(_express, _scope);
  } catch (error) {
    console.warn(error)
    return undefined;
  }
}

function Code(_express, scope) {
  var express = codeCacher.get(_express);
  if (express == undefined)
    codeCacher.set(_express, express = _express.replace($word, word =>
      "scope.".concat(word)
    ));

  return new Function('scope',
    `return ${express};`
  )(scope);
}

export function codex(_express, _scope) {
  try {
    global.$path = undefined;
    _express = `'${_express.replace($expres, "'+($1)+'")}'`;
    return Codex(_express, _scope);
  } catch (error) {
    console.warn(error)
    return undefined;
  }
}

function Codex(_express, scope) {
  var express = codeCacher.get(_express);
  if (express == undefined)
    codeCacher.set(_express, express = _express.replace($word, word =>
      word.match(/["']/) ? word : "scope.".concat(word)
    ));

  return new Function('scope',
    `return ${express};`
  )(scope);
}

export function Path(path) {
  try {
    return path.replace(/(\w+)\.?/g, "['$1']");
  } catch (error) {
    console.warn(error)
    return undefined;
  }
}

export function handler(proto, field, scope, key) {
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