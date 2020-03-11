import { $chen, $express } from "./ViewExpress"
import { selfClose, forEach, attrRender } from "./ViewLang"

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
      return `\nReact.createRender("${this.name}",${attrs})`;
    }
    else {
      let attrs = JSON.stringify(this.attrs);
      return `\nReact.createRender("${this.name}",${attrs}`;
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
      return `\nReact.createFunction("${this.name}",${attrs}`;
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
    return `\nReact.createRender("${name}",null)`;
  }
}

export class Render {
  constructor() {
    this.status = null;
    this.value = null;
  }
  when(status, method) {
    if (this.status == null && status) {
      this.status = status;
      this.value = method();
    }
    else if (this.status == null && status == undefined) {
      this.status = status;
      this.value = method();
    }
    return this;
  }
  forEach(object, method) {
    let list = this.value = [];
    forEach(object, (value, key) => {
      let arr = method(value, key);
      list.push.apply(list, arr);
    });
    return this;
  }
  toString() {
    return this.value.join("");
  }
}

export let React = {
  createFunction(name, param, ...children) {
    if ("@when" == name) {
      return `\nnew Render().when(${param}, () => [${children}])`;
    }
    else if (".when" == name) {
      return `\n.when(${param}, () => [${children}])`;
    }
    else if ("@each" == name) {
      let params = param.split(":"), object = params.pop();
      return `\nnew Render().forEach(${object}, (${params}) => [${children}])`;
    }
  },
  createRender(name, attr, ...children) {
    let express;
    if (attr) {
      return `\nReact.createElement("${name}",${JSON.stringify(attr)},${children})`;
    }
    else if (express = name.match($express)) {
      return `\nReact.createElement(${express[1]},null)`;
    }
    else {
      return `\nReact.createElement("${name}",null)`;
    }
  },
  createElement(name, attr, ...children) {
    if (attr) {
      let element = document.createElement(name);
      children.forEach(a => a instanceof Render ? a.value.forEach(b => element.appendChild(b)) : element.appendChild(a));
      setAttribute(element, attr);
      return element;
    }
    else {
      let element = document.createTextNode(name);
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