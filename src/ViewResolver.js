import { $chen, $express } from "./ViewExpress"
import { selfClose, forEach } from "./ViewLang"
import { ReactScope, handler } from "./ViewScope"
import { global } from "./ViewIndex"

export class TagNode {
  constructor(name) {
    this.type = "TAG";
    this.name = name;
    this.attrs = {};
  }
  setName(attr) {
    if (attr == "") {
      return;
    }
    else if (this.name) {
      let index = attr.indexOf("=");
      let name = attr.slice(0, index);
      let value = attr.slice(index + 2, attr.length - 1);
      Reflect.set(this.attrs, name, value)
    }
    else {
      this.name = attr;
    }
  }
  react() {
    if (this.name.startsWith("/")) {
      return ")";
    }
    else if (selfClose(this.name)) {
      let attrs = JSON.stringify(this.attrs);
      return `React.createRender("${this.name}",${attrs})`;
    }
    else {
      let attrs = JSON.stringify(this.attrs);
      return `React.createRender("${this.name}",${attrs}`;
    }
  }
}

export class FuncNode {
  constructor(list, name, text) {
    this.type = "FUNC";
    this.name = name;
    this.attrs = {};
    this.setName(list, text)
  }
  setName(list, text) {
    if (this.name.startsWith(".when")) {
      list.push(this);
      let chen = this.name.match($chen);
      this.attrs = chen[3];
      this.name = chen[1];
    }
    else if (this.name.startsWith("}")) {
      let name = text.slice(0, text.indexOf(this.name));
      list.push(new TextNode(name));
      list.push(this);
    }
    else if (this.name.startsWith("{")) {
      let name = text.slice(0, text.indexOf(this.name));
      list.push(new TextNode(name));
      list.push(new TextNode(this.name));
    }
    else {
      let name = text.slice(0, text.indexOf(this.name));
      list.push(new TextNode(name));
      list.push(this);
      let chen = this.name.match($chen);
      this.attrs = chen[3];
      this.name = chen[1];
    }
  }
  react() {
    if (this.name.startsWith("}")) {
      return ")";
    }
    else {
      let attrs = JSON.stringify(this.attrs);
      return `React.createFunction("${this.name}",${attrs}`;
    }
  }
}

export class TextNode {
  constructor(name) {
    this.type = "TEXT";
    this.name = name;
  }
  setName(attr) {
    this.name = attr;
  }
  react() {
    let name = this.name.replace(/\n/g, "");
    return `React.createRender("${name}",null)`;
  }
}

export class Render {
  constructor(scope, params, func) {
    this.func = func;
    this.scope = scope;
    this.params = params;
    this.status = null;
    this.value = new Map();
  }
  when(status, method) {
    let map = this.value, list = [];
    let scope = this.scope;
    if (this.status == null && status) {
      this.status = status;
      setCache(global.cache, method, scope, list);
      global.cache = new Map();
      let methods = method(this.scope);
      map.set(scope, list);
      methods.forEach(func => render(list, scope, func));
    }
    else if (this.status == null && status == undefined) {
      this.status = status;
      setCache(global.cache, method, scope, list);
      global.cache = new Map();
      let methods = method(this.scope);
      map.set(scope, list);
      methods.forEach(func => render(list, scope, func));
    }
    return this;
  }
  forEach(object, method) {
    let map = this.value, arr = [];
    let params = this.params.split(",");
    let field = params[0], id = params[1];
    setCache(global.cache, this.func, this.scope, arr);
    global.cache = new Map();
    forEach(object, (value, index) => {
      let list = [];
      let scope = Object.create(this.scope.$target);
      scope[id] = index;
      scope = new Proxy(scope, handler(this.scope, object, field, index));
      setCache(global.cache, method, scope, list);
      global.cache = new Map();
      let methods = method(scope);
      map.set(scope, list);
      methods.forEach(func => render(list, scope, func));
      arr.push.apply(list);
    });
    return this;
  }
  toString() {
    return this.value.join("");
  }
}

function render(list, scope, funcNode) {
  let child = funcNode(scope);
  if (child instanceof Render) {
    list.push.apply(child.value);
  } else {
    list.push(child);
  }
}

export let React = {
  createFunction(name, param, ...children) {
    if ("@when" == name) {
      return `\n _scope=>new Render(_scope,null,arguments.callee).when(${ReactScope(param)}, (_scope) => [${children}])`;
    }
    else if (".when" == name) {
      return `\n .when(${ReactScope(param)}, (_scope) => [${children}])`;
    }
    else if ("@each" == name) {
      let params = param.split(":"), object = params.pop();
      return `\n _scope=>new Render(_scope,'${params}',arguments.callee).forEach(${ReactScope(object)}, (_scope) => [${children}])`;
    }
  },
  createRender(name, attr, ...children) {
    let express;
    if (attr) {
      return `\n _scope=>React.createElement("${name}",_scope,arguments.callee,${JSON.stringify(attr)},${children})`;
    }
    else if (express = name.match($express)) {
      return `\n _scope=>React.createElement(${ReactScope(express[1])},_scope,arguments.callee,null)`;
    }
    else {
      return `\n _scope=>React.createElement("${name}",_scope,arguments.callee,null)`;
    }
  },
  createElement(name, scope, func, attr, ...children) {
    if (attr) {
      let element = document.createElement(name);
      children.forEach(funcNode => {
        let child = funcNode(scope);
        child instanceof Render ? child.value.forEach(a => a.forEach(c => element.appendChild(c))) : element.appendChild(child)
      });
      setCache(global.cache, func, scope, [element]);
      global.cache = new Map();
      setAttribute(element, attr);
      return element;
    }
    else {
      let element = document.createTextNode(name);
      setCache(global.cache, func, scope, [element]);
      global.cache = new Map();
      return element;
    }
  }
}

function setAttribute(element, attr) {
  forEach(attr, (value, name) => {
    if (name.startsWith("@")) {
      bind(element, name.slice(1), value, we.action)
    } else {
      let attribute = document.createAttribute(name);
      attribute.value = value;
      element.setAttributeNode(attribute);
    }
  });
}

function bind(owner, key, value, action) {
  var array = value.match(/(.*)\((.*)\)/);
  if (array) {
    var name = array[1];
    let method = Reflect.get(action, name);
    owner.on(key, method, we.model, array[2]);
  }
  else {
    let method = Reflect.get(action, value);
    owner.on(key, method, we.model);
  }
}

function setCache(cache, func, scope, child) {
  cache.forEach(value => {
    let cache = value;
    if (cache) {
      cache.set(func, { scope, child });
    }
  });
}