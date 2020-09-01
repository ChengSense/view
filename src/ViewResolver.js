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
  constructor(scope, func) {
    this.func = func;
    this.scope = scope;
    this.status = null;
    this.value = [];
  }
  when(status, children) {
    let list = this.value;
    let scope = this.scope;
    if (this.status == null && status) {
      this.status = status;
      setCache(this.func, scope, list);
      children.forEach(func => render(list, scope, func));
    }
    else if (this.status == null && status == undefined) {
      this.status = status;
      setCache(this.func, scope, list);
      children.forEach(func => render(list, scope, func));
    }
    return this;
  }
  forEach(object, field, id, children) {
    let arr = this.value, forFunc;
    setCache(this.func, this.scope, arr);
    forEach(object, forFunc = (value, index) => {
      let scope = Object.create(this.scope.$target);
      scope[id] = index;
      scope = new Proxy(scope, handler(this.scope, object, field, index));
      let list = [];
      setCache(forFunc, scope, list);
      children.forEach(func => render(list, scope, func));
      list.forEach(a => arr.push(a));
      return list;
    });
    return this;
  }
  toString() {
    return this.value.join("");
  }
}

function render(list, scope, funcNode) {
  let child = funcNode(scope, funcNode);
  if (child instanceof Render) {
    child.value.forEach(a => list.push(a));
  } else {
    list.push(child);
  }
}

export let React = {
  createFunction(name, param, ...children) {
    if ("@when" == name) {
      return `\n (_scope,func)=>new Render(_scope,func).when(${ReactScope(param)}, [${children}])`;
    }
    else if (".when" == name) {
      return `\n .when(${ReactScope(param)}, [${children}])`;
    }
    else if ("@each" == name) {
      let params = param.split(":"), object = params.pop();
      return `\n (_scope,func)=>new Render(_scope,func).forEach(${ReactScope(object)},'${params.shift()}','${params.shift()}', [${children}])`;
    }
  },
  createRender(name, attr, ...children) {
    let express;
    if (attr) {
      return `\n (_scope,func)=>React.createElement("${name}",_scope,func,${JSON.stringify(attr)},${children})`;
    }
    else if (express = name.match($express)) {
      return `\n (_scope,func)=>React.createElement(${ReactScope(express[1])},_scope,func,null)`;
    }
    else {
      return `\n (_scope,func)=>React.createElement("${name}",_scope,func,null)`;
    }
  },
  createElement(name, scope, func, attr, ...children) {
    if (attr) {
      let element = document.createElement(name);
      setCache(func, scope, [element]);
      children.forEach(funcNode => {
        let child = funcNode(scope, funcNode);
        child instanceof Render ? child.value.forEach(a => element.appendChild(a)) : element.appendChild(child)
      });
      setAttribute(element, attr);
      return element;
    }
    else {
      let element = document.createTextNode(name);
      setCache(func, scope, [element]);
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

function setCache(func, scope, child) {
  let caches = global.cache;
  caches.forEach(cache => {
    let value = cache.get(func);
    if (value) {
      value.child.push.apply(child);
    } else {
      cache.set(func, { scope, child });
    }
  });
  global.cache = new Map();
}