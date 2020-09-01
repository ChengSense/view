let $lang = /(@each|@when|\.when)\s*\((.*)\)\s*\{|\.when\s*\{|\{([^\{\}]*)\}|\}/g;
let $chen = /(@each|@when|\.when)\s*(\((.*)\))?\s*\{/;
let $express = /\{([^\{\}]*)\}/;
let $when = /,\s*\.when/g;

function toChars(html) {
  return html.split("");
}

function selfClose(name) {
  let node = document.createElement(name);
  return !new RegExp(/<\/\w+>/).test(node.outerHTML);
}

function forEach(object, method) {
  Object.keys(object).forEach(key => {
    let value = Reflect.get(object, key);
    method(value, key);
  });
}

class TagNode {
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
      Reflect.set(this.attrs, name, value);
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

class FuncNode {
  constructor(list, name, text) {
    this.type = "FUNC";
    this.name = name;
    this.attrs = {};
    this.setName(list, text);
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

class TextNode {
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

class Render {
  constructor(scope, func) {
    this.func = func;
    this.scope = scope;
    this.status = null;
    this.value = new Map();
  }
  when(status, children) {
    let map = this.value, list = [];
    let scope = this.scope;
    if (this.status == null && status) {
      this.status = status;
      setCache(global.cache, this.func, scope, list);
      global.cache = new Map();
      map.set(scope, list);
      children.forEach(func => render(list, scope, func));
    }
    else if (this.status == null && status == undefined) {
      this.status = status;
      setCache(global.cache, this.func, scope, list);
      global.cache = new Map();
      map.set(scope, list);
      children.forEach(func => render(list, scope, func));
    }
    return this;
  }
  forEach(object, field, id, children) {
    let map = this.value, arr = [], forFunc;
    setCache(global.cache, this.func, this.scope, arr);
    global.cache = new Map();
    forEach(object, forFunc = (value, index) => {
      let list = [];
      let scope = Object.create(this.scope.$target);
      scope[id] = index;
      scope = new Proxy(scope, handler(this.scope, object, field, index));
      setCache(global.cache, forFunc, scope, list);
      global.cache = new Map();
      map.set(scope, list);
      children.forEach(func => render(list, scope, func));
      arr.push.apply(list);
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
    list.push.apply(child.value);
  } else {
    list.push(child);
  }
}

let React = {
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
      setCache(global.cache, func, scope, [element]);
      global.cache = new Map();
      children.forEach(funcNode => {
        let child = funcNode(scope, funcNode);
        child instanceof Render ? child.value.forEach(a => a.forEach(c => element.appendChild(c))) : element.appendChild(child);
      });
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
};

function setAttribute(element, attr) {
  forEach(attr, (value, name) => {
    if (name.startsWith("@")) {
      bind(element, name.slice(1), value, we.action);
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

function setCache(caches, func, scope, child) {
  caches.forEach(cache => {
    let value = cache.get(func);
    if (value) {
      value.child.push.apply(child);
    } else {
      cache.set(func, { scope, child });
    }
  });
}

function ReactCode(express) {
  return new Function('React',
    `return ${express};`
  )(React);
}

function RenderCode(express, we) {
  window.we = we;
  return new Function('we', 'React', 'Render',
    `return ${express};
    `
  )(we, React, Render);
}

function ReactScope(_express) {
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

function handler(proto, scope, field, key) {
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

function AST(html) {
  let list = [];
  let open = "<", quote = "\"", close = ">";
  let chem = null, node = null, token = null;
  let chars = toChars(html);
  chars.reduce((a, b) => {
    if (a == open) {
      let c = b;
      token = close;
      node = new TagNode();
      return c;
    }
    else if (token == quote && b == quote) {
      let c = a.concat(b);
      node.setName(c.trim());
      token = close;
      return "";
    }
    else if (token == close && b == close) {
      let c = a;
      token = null;
      node.setName(c);
      list.push(node);
      node = new TextNode();
      return "";
    }
    else if (b == quote) {
      let c = a.concat(b);
      token = quote;
      return c;
    }
    else if (b == open) {
      node.setName(a);
      list.push(node);
      return b;
    }
    else if (node.type == "TAG" && !node.name && b == " ") {
      node.setName(a);
      return "";
    }
    else if (node.type == "TEXT" && (chem = a.match($lang))) {
      new FuncNode(list, chem[0], a);
      return b;
    }
    else {
      let c = a.concat(b);
      return c;
    }
  });
  return list;
}

function Transfer(html) {
  let list = AST(html).
    filter(a => a.name.trim() != "");

  let express = list.
    map(a => a.react()).
    join().trim();

  let func = ReactCode(express).
    replace($when, ".when").
    trim();

  return func;
}

function observer(target, watcher, we) {
  return new Proxy(target, handler$1(watcher, we));
}

function handler$1(watcher, we, root) {
  let values = new Map(), caches = new Map();
  return {
    get(parent, prop, proxy) {
      if (prop == "$target") return parent;
      if (!parent.hasOwnProperty(prop) && Reflect.has(parent, prop)) return Reflect.get(parent, prop);
      let value = values.get(prop);
      let path = root ? `${root}.${prop}` : prop;
      global.cache.delete(root);
      global.cache.set(path, caches.get(prop));
      if (value != undefined) return value;
      value = Reflect.get(parent, prop);
      if (typeof value == "object") value = new Proxy(value, handler$1(watcher, we, path));
      values.set(prop, value);
      caches.set(prop, new Map());
      global.cache.delete(root);
      global.cache.set(path, caches.get(prop));
      watcher.get(path);
      return value;
    },
    set(parent, prop, val, proxy) {
      if (!parent.hasOwnProperty(prop) && Reflect.has(parent, prop)) return Reflect.set(parent, prop, val);
      let oldValue = values.get(prop);
      let oldCache = caches.get(prop);
      values.delete(prop);
      caches.delete(prop);
      Reflect.set(parent, prop, val.$target || val);
      let value = proxy[prop];
      setValue(value, oldValue, watcher, we);
      let path = root ? `${root}.${prop}` : prop;
      watcher.set(new Map([[path, oldCache]]), new Map([[path, caches.get(prop)]]), prop, we);
      return true;
    }
  }
}

function setValue(object, oldObject, watcher, we) {
  if (typeof object == "object" && typeof oldObject == "object") {
    Object.keys(oldObject).forEach(prop => {
      global.cache = new Map();
      let value = object[prop], cache = global.cache;
      global.cache = new Map();
      let oldValue = oldObject[prop], oldCache = global.cache;
      if (typeof value != "object" && typeof oldValue != "object") watcher.set(oldCache, cache, prop, we);
      setValue(value, oldValue, watcher, we);
    });
  }
}

function query(express) {
  try {
    var doc = document.querySelectorAll(express);
    return doc;
  } catch (error) {
    var newNode = document.createElement("div");
    newNode.innerHTML = express.trim();
    return newNode.childNodes;
  }
}

function addListener(type, methods, scope) {
  if (this.addEventListener) {
    this.addEventListener(type, function (event) {
      methods.forEach((params, method) => {
        params.forEach(param => {
          let args = param ? [param] : [];
          args.push(event);
          method.apply(scope, args);
        });
      });
    }, false);
  }
  else if (this.attachEvent) {
    this.attachEvent(`on${type}`, function (event) {
      methods.forEach((params, method) => {
        params.forEach(param => {
          let args = param ? code(`[${param}]`, scope) : [];
          args.push(event);
          let proto = Reflect.getPrototypeOf(method);
          let action = Object.assign({}, proto);
          Reflect.setPrototypeOf(action, scope || method.$model);
          method.apply(action, args);
        });
      });
    });
  }
  else {
    element[`on${type}`] = function (event) {
      methods.forEach((params, method) => {
        params.forEach(param => {
          let args = param ? code(`[${param}]`, scope) : [];
          args.push(event);
          let proto = Reflect.getPrototypeOf(method);
          let action = Object.assign({}, proto);
          Reflect.setPrototypeOf(action, scope || method.$model);
          method.apply(action, args);
        });
      });
    };
  }
}

function removeListener(type, handler) {
  if (this.addEventListener) {
    this.removeEventListener(type, handler, false);
  }
  else if (this.detachEvent) {
    this.detachEvent(`on${type}`, handler);
  }
  else {
    element[`on${type}`] = null;
  }
}

Object.assign(Node.prototype, {
  on: function (type, handler, scope, params) {
    if (this._manager) {
      if (this._manager.get(type)) {
        let methods = this._manager.get(type);
        if (methods.get(handler)) {
          methods.get(handler).ones(params);
        }
        else {
          methods.set(handler, [params]);
        }
      }
      else {
        let methods = new Map();
        methods.set(handler, [params]);
        this._manager.set(type, methods);
        addListener.call(this, type, methods, scope);
      }
    }
    else {
      let methods = new Map();
      methods.set(handler, [params]);
      this._manager = new Map();
      this._manager.set(type, methods);
      addListener.call(this, type, methods, scope);
    }
    return this;
  },
  off: function (type, handler) {
    if (this._manager) {
      let methods = this._manager.get(type);
      if (methods == undefined) return;
      methods.delete(handler);
      if (methods.size) return;
      this._manager.delete(type);
      removeListener.call(this, type, handler);
    }
    return this;
  },
  reappend(node) {
    this.innerHTML = "";
    this.appendChild(node);
    return this;
  },
  before(node) {
    this.parentNode.insertBefore(node, this);
  },
  after(node) {
    if (this.nextSibling)
      this.parentNode.insertBefore(node, this.nextSibling);
    else
      this.parentNode.appendChild(node);
  }
});

Object.assign(NodeList.prototype, {
  on(type, call) {
    forEach(this, function (node) {
      node.on(type, call);
    });
    return this;
  },
  off(type, call) {
    forEach(this, function (node) {
      node.off(type, call);
    });
    return this;
  }
});

let global = { $path: null, cache: new Map() };

class View {
  constructor(app) {
    this.view = app.view;
    this.model = observer(app.model, watcher, this);
    this.action = app.action;
    this.watch = app.watch;
    this.filter = app.filter;
    this.creater(app);
  }
  creater(app) {
    this.view = Transfer(this.view);
    console.warn(this.view);
    let func = RenderCode(this.view, this);
    this.node = RenderCode(this.view, this)(this.model, func);
  }
}

let watcher = {
  set(cache, newCache, prop, we) {
    cache.forEach(caches => {
      caches.forEach((param, func) => {
        let childNodes = param.child; param.child = [];
        let element = childNodes[0];
        let funcNodes = func.name == "forFunc" ? func(param.scope, prop, func) : func(param.scope, func);
        if (!element) return;
        funcNodes = Array.isArray(funcNodes) ? funcNodes : [funcNodes];
        funcNodes.forEach(funcNode => {
          //let child = funcNode(param.scope, funcNode);
          if (funcNode instanceof Render) {
            funcNode.value.forEach(a => a.forEach(c => {
              param.child.push(c);
              element.before(c);
            }));
          } else {
            param.child.push(funcNode);
            element.before(funcNode);
          }
        });
        childNodes.forEach(a => a.parentNode.removeChild(a));
      });
    });
  },
  get(path) {

  }
};

window.View = View;

export { React, Render, View, global, query };
