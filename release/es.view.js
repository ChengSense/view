function whiles(list, method) {
  while (list.length) {
    if (method(list.shift()))
      break;
  }
}

function forEach(obj, method) {
  if (!obj) return;
  if (Array.isArray(obj)) {
    for (let i = obj.index || 0; i < obj.length; i++) {
      method(obj[i], i);
    }
  } else {
    Object.keys(obj).forEach(i =>
      method(obj[i], i)
    );
  }
}

function farEach(list, method) {
  list.every((value, i) =>
    !method(value, i)
  );
}

function slice(obj) {
  return [].slice.call(obj);
}

function blank(str) {
  return str == null || str == undefined || str == "";
}

Object.assign(Array.prototype, {
  remove(n) {
    var index = this.indexOf(n);
    if (index > -1)
      this.splice(index, 1);
    return this;
  },
  replace(o, n) {
    var index = this.indexOf(o);
    if (index > -1)
      this.splice(index, 1, n);
  },
  splices(items) {
    this.splice.apply(this, items);
  },
  has(o) {
    var index = this.indexOf(o);
    if (index > -1)
      return true;
    return false
  },
  ones(o) {
    if (this.has(o)) return;
    this.push(o);
  }
});

var $lang = /<\s*([^\s"'<>=]+)(?:[^"'>]|"[^"]*"|'[^']*')*>|(@each|@when|\.when)\s*\((.*)\)\s*\{|\.when\s*\{|\{([^\{\}]*)\}|\}/g;
var $chen = /(@each|@when|\.when)\s*\((.*)\)\s*\{|\.when\s*\{/;
var $each = /(@each)\s*\((.*)\)\s*\{/g;
var $eash = /(@each)\s*=\s*("([^"]*)"|'([^']*)')/;
var $id = /@(id)\s*=\s*("([^"]*)"|'([^']*)')/;
var $event = /@(\w*)\s*=\s*("([^"]*)"|'([^']*)')/;
var $when = /(@when|\.when)\s*\((.*)\)\s*\{|\.when\s*\{/g;
var $whec = /\.when\s*\((.*)\)\s*\{|\.when\s*\{/g;
var $whea = /@when/g;
let $attr = /\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/g;
var $express = /\{([^\{\}]*)\}/g;
var $close = /^\}$|<\s*\/\w+>/;
var $word = /("[^"]*"|'[^']*')|(\.?([_\$_a-zA-Z]+\w?)(\.([_\$a-zA-Z]+\w?))*)/g;
var $html = /<\s*([^\s"'<>=]+)(?:[^"'>]|"[^"]*"|'[^']*')*>/;

function code(_express, _scope) {
  try {
    global.$path = undefined;
    global.$cache = new Map();
    _express = _express.replace($express, "$1");
    return Code(_express, _scope);
  } catch (error) {
    console.warn(error);
    return undefined;
  }
}

function codex(_express, _scope, we) {
  try {
    global.$path = undefined;
    global.$cache = new Map();
    _express = `'${_express.replace($express, "'+($1)+'")}'`;
    return codec(_express, _scope, we);
  } catch (error) {
    console.warn(error);
    return undefined;
  }
}

function codeo(_express, _scope, we) {
  try {
    global.$path = undefined;
    global.$cache = new Map();
    _express = _express.replace($express, "$1");
    return codec(_express, _scope, we);
  } catch (error) {
    console.warn(error);
    return undefined;
  }
}

function codec(_express, _scope, we) {
  try {
    let filter = Reflect.getPrototypeOf(we.filter);
    Reflect.setPrototypeOf(filter, _scope);
    return Code(_express, we.filter);
  } catch (error) {
    console.warn(error);
    return undefined;
  }
}

let codeCacher = new Map();

function Code(_express, scope) {
  var express = codeCacher.get(_express);
  if (express == undefined)
    codeCacher.set(_express, express = _express.replace($word, word =>
      word.match(/^["'\.]/) ? word : "scope.".concat(word)
    ));

  return new Function('scope',
    `return ${express};`
  )(scope);
}

function handler(proto, field, scope, key) {
  return {
    get(parent, prop) {
      if (field == prop) return Reflect.get(scope, key);
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

function setScopes(we) {
  let action = { $view: we.view, $model: we.model, $action: we.action, $watch: we.watch, $ref: we.ref };
  we.action = we.action || {};
  Reflect.setPrototypeOf(action, Function.prototype);
  Object.values(we.action).forEach(method => Reflect.setPrototypeOf(method, action));

  let filter = Object.assign({}, action);
  we.filter = we.filter || {};
  Reflect.setPrototypeOf(we.filter, filter);
}

function Compiler(node, scopes, childNodes, content, we) {

  function compiler(node, scopes, childNodes, content) {
    farEach(childNodes, function (child) {
      if (child.clas.nodeType == 1) {
        if ((/(CODE|SCRIPT)/).test(child.clas.nodeName)) {
          var newNode = child.clas.cloneNode(true);
          node.appendChild(newNode);
          var clasNodes = classNode(newNode, child);
          content.childNodes.push(clasNodes);
        }
        else {
          var newNode = child.clas.cloneNode();
          node.appendChild(newNode);
          var clasNodes = classNode(newNode, child);
          content.childNodes.push(clasNodes);
          component(newNode, scopes, clasNodes, content);
          compiler(newNode, scopes, child.children, clasNodes);
          commom(newNode, scopes, clasNodes, child);
        }
      }
      else if (new RegExp($each).test(child.clas.nodeValue)) {
        var expreses = child.clas.nodeValue.replace($each, "$2").split(":");
        var field = expreses.shift().trim(), source = expreses.pop().trim(), id = expreses.shift();
        var sources = code(source, scopes), clas = eachNode(null, node, child);
        content.childNodes.push(clas);
        binding.each(null, scopes, clas, content);
        forEach(sources, function (item, index) {
          var scope = Object.create(scopes.$target);
          if (id) scope[id.trim()] = index;
          scope = new Proxy(scope, handler(scopes, field, sources, index));
          compiler(node, scope, child.children, clas);
        });
      }
      else if (new RegExp($whea).test(child.clas.nodeValue)) {
        var clas = whenNode(null, node, child, content);
        content.childNodes.push(clas);
        farEach(child.children, function (child) {
          var when = code(child.clas.nodeValue.replace($when, "$2"), scopes);
          binding.when(null, scopes, clas, content);
          if (when || when == undefined) {
            compiler(node, scopes, child.children, clas);
            return true;
          }
        });
      }
      else {
        var newNode = child.clas.cloneNode();
        node.appendChild(newNode);
        var clasNodes = classNode(newNode, child);
        content.childNodes.push(clasNodes);
        commom(newNode, scopes, clasNodes);
      }
    });
  }

  function attrExpress(node, scope) {
    forEach(node.attributes, function (child) {
      if (!child) return;
      let clas = attrNode(child, scope, child.cloneNode());
      if (clas.clas.name == ":model") {
        model(child, scope);
      }
      else if (new RegExp($express).test(child.nodeValue)) {
        if (clas.clas.name == "value") model(child, scope);
        child.nodeValue = codex(child.nodeValue, scope, we);
        binding.express(child, scope, clas);
      }
    });
  }

  function bind(owner, scope, child) {
    if (child && child.action)
      child.action.forEach((value, key) => {
        var array = value.toString().match(/\(([^)]*)\)/);
        if (array) {
          var name = value.toString().replace(array[0], "");
          let method = code(name, we.action);
          owner.on(key, method, scope, array[1]);
        }
        else {
          let method = code(value, we.action);
          owner.on(key, method, scope);
        }
      });
  }

  function component(node, scope, clas, content) {
    if (Reflect.has(we.component, node.localName)) {
      comNode(node, scope, clas, content);
      let app = new we.component[node.localName]();
      resolver.component(app, clas, we);
    }
  }

  function commom(node, scope, clas, child) {
    let express;
    attrExpress(node, scope);
    bind(node, scope, child);
    if (express = new RegExp($express).exec(node.nodeValue)) {
      node.nodeValue = codeo(express[1], scope, we);
      binding.express(node, scope, clas);
    }
  }

  let binding = {
    each(node, scope, clas, content) {
      if (global.$cache == undefined) return;
      clas.resolver = "each";
      clas.content = content;
      clas.scope = scope;
      clas.node = node;
      setCache(clas, we, global.$cache);
    },
    when(node, scope, clas) {
      if (global.$cache == undefined) return;
      clas.resolver = "when";
      clas.scope = scope;
      clas.node = node;
      setCache(clas, we, global.$cache);
    },
    express(node, scope, clas) {
      if (global.$cache == undefined) return;
      clas.resolver = "express";
      clas.scope = scope;
      clas.node = node;
      setCache(clas, we, global.$cache);
    }
  };

  function model(node, scope) {
    let owner = node.ownerElement;
    owner._express = node.nodeValue.replace($express, "$1");
    let _express = `scope.${owner._express}`;
    let method = (input[owner.type] || input[owner.localName] || input.other);
    method(node, scope, _express);
  }

  let input = {
    checkbox(node, scope, _express) {
      try {
        var owner = node.ownerElement;
        owner.on("change", function () {
          let _value = owner.value.replace(/(\'|\")/g, "\\$1");
          let value = code(owner._express, scope);
          owner.checked ? value.ones(_value) : value.remove(_value);
        }, scope);
        let value = code(owner._express, scope);
        if (Array.isArray(value) && value.has(owner.value)) owner.checked = true;
      } catch (error) {
        console.error(error);
      }
    },
    radio(node, scope, _express) {
      try {
        var owner = node.ownerElement;
        owner.on("change", function () {
          let _value = owner.value.replace(/(\'|\")/g, "\\$1");
          let express = `${_express}='${_value}';`;
          new Function('scope', express)(scope);
        }, scope);
        let value = code(owner._express, scope);
        if (value == owner.value) owner.checked = true;
        owner.name = global.$path;
      } catch (error) {
        console.error(error);
      }
    },
    select(node, scope, _express) {
      try {
        var owner = node.ownerElement, handle;
        owner.on("change", handle = function () {
          let _value = owner.value.replace(/(\'|\")/g, "\\$1");
          let express = `${_express}='${_value}';`;
          new Function('scope', express)(scope);
        }, scope);
        let value = code(owner._express, scope);
        blank(value) ? handle() : owner.value = value;
      } catch (error) {
        console.error(error);
      }
    },
    other(node, scope, _express) {
      try {
        var owner = node.ownerElement;
        owner.on("change", function () {
          let _value = owner.value.replace(/(\'|\")/g, "\\$1");
          let express = `${_express}='${_value}';`;
          new Function('scope', express)(scope);
        }, scope);
      } catch (error) {
        console.error(error);
      }
    }
  };

  function classNode(newNode, child) {
    return {
      id: child.id,
      node: newNode,
      clas: child.clas,
      scope: child.scope,
      children: child.children,
      childNodes: []
    };
  }

  function eachNode(newNode, node, child) {
    var comment = document.createComment("each:".concat(global.$path));
    node.appendChild(comment);
    return {
      node: newNode,
      clas: child.clas,
      scope: child.scope,
      children: child.children,
      childNodes: [{
        node: comment,
        clas: child.clas,
        scope: child.scope,
        children: [],
        childNodes: []
      }]
    };
  }

  function whenNode(newNode, node, child, content) {
    var comment = document.createComment("when:".concat(global.$path));
    node.appendChild(comment);
    return {
      node: newNode,
      clas: child.clas,
      scope: child.scope,
      content: content,
      children: child.children,
      childNodes: [{
        node: comment,
        clas: child.clas,
        scope: child.scope,
        children: [],
        childNodes: []
      }]
    };
  }

  function comNode(node, scope, clas, content) {
    var comment = document.createComment("component");
    node.parentNode.replaceChild(comment, node);
    clas.scope = scope;
    clas.resolver = "component";
    clas.content = content;
    clas.childNodes.push({
      node: comment,
      content: clas,
      children: [],
      childNodes: []
    });
  }

  function attrNode(newNode, scope, clas) {
    return {
      node: newNode,
      clas: clas,
      scope: scope,
      children: [],
      childNodes: []
    };
  }

  compiler(node, scopes, childNodes, content);

}

function compoNode(node, child, component) {
  var comment = document.createComment("component");
  node.before(comment);
  component.content.node = component.view;
  return {
    id: child.id,
    clas: child.clas,
    scope: child.scope,
    resolver: child.resolver,
    content: child.content,
    children: [component.node],
    childNodes: [{
      node: comment,
      scope: child.scope,
      children: [],
      childNodes: []
    }, component.content]
  };
}

var resolver = {
  view: function (view, node, scope, content, we) {
    try {
      var doc = document.createDocumentFragment();
      new Compiler(doc, scope, slice(node.children), content, we);
      content.children = node.children;
      content.clas = node.clas;
      view.reappend(doc);
    } catch (error) {
      console.error(error);
    }
  },
  component: function (app, node, we) {
    try {
      Reflect.setPrototypeOf(app.model, node.scope);
      var insert = insertion(node.childNodes);
      var childNodes = node.content.childNodes;
      clearNodes(node.childNodes);
      let component = new View({ view: app.view, model: app.model, action: app.action });
      let clasNodes = compoNode(insert, node, component);
      childNodes.replace(node, clasNodes);
      if (insert.parentNode) insert.parentNode.replaceChild(component.view, insert);
      if (!node.id) return;
      let id = codex(node.id, node.scope, we);
      Reflect.set(clasNodes, `@${id}`, component);
    } catch (error) {
      console.error(error);
    }
  },
  when: function (node, we) {
    try {
      var insert = insertion(node.childNodes);
      var doc = document.createDocumentFragment();
      var childNodes = node.content.childNodes;
      clearNodes(node.childNodes);
      new Compiler(doc, node.scope, [node], node.content, we);
      childNodes.replace(node, childNodes.pop());
      if (insert.parentNode)
        insert.parentNode.replaceChild(doc, insert);
    } catch (error) {
      console.error(error);
    }
  },
  each: function (node, we) {
    try {
      var insert = insertion(node.childNodes);
      var doc = document.createDocumentFragment();
      var childNodes = node.content.childNodes;
      clearNodes(node.childNodes);
      new Compiler(doc, node.scope, [node], node.content, we);
      childNodes.replace(node, childNodes.pop());
      if (insert.parentNode)
        insert.parentNode.replaceChild(doc, insert);
    } catch (error) {
      console.error(error);
    }
  },
  array: function (node, we, index, nodes) {
    try {
      var insert = insertNode([node.childNodes[index]]);
      var doc = document.createDocumentFragment();
      var child = { clas: node.clas, children: node.children, scope: node.scope };
      var content = { childNodes: [], children: [] };
      new Compiler(doc, node.scope, [child], content, we);
      doc.removeChild(doc.childNodes[0]);
      var childNodes = slice(content.childNodes[0].childNodes);
      childNodes.splice(0, 1, index + 1, 0);
      node.childNodes.splices(childNodes);
      nodes.remove(content.childNodes[0]);
      if (insert.parentNode) insert.after(doc);
    } catch (error) {
      console.error(error);
    }
  },
  express: function (node, we, cache) {
    try {
      node.node.nodeValue = codex(node.clas.nodeValue, node.scope, we);
      setCache(node, we, cache);
      if (node.node.name == "value")
        node.node.ownerElement.value = node.node.nodeValue;
    } catch (error) {
      console.error(error);
    }
  },
  attribute: function (node, we, cache) {
    try {
      var newNode = document.createAttribute(codex(node.clas.name, scope));
      setCache(node, we, cache);
      newNode.nodeValue = node.clas.nodeValue;
      node.node.ownerElement.setAttributeNode(newNode);
      node.node.ownerElement.removeAttributeNode(node.node);
    } catch (error) {
      console.error(error);
    }
  }
};

var cacher = function (cache, index, add) {
  cache.forEach((nodes, we) => {
    nodes.forEach(node => {
      try {
        if (arrayEach[node.resolver])
          arrayEach[node.resolver](node, we, nodes, index, add);
        else
          resolver[node.resolver](node, we, cache);
      } catch (error) {
        console.error(error);
      }
    });
  });
};

var arrayEach = {
  each: function (node, we, children, index, add) {
    try {
      if (add > 0) {
        resolver.array(node, we, index, children);
      }
      else {
        var nodes = node.childNodes.splice(index + 1);
        clearNodes(nodes);
      }
    } catch (error) {
      console.error(error);
    }
  }
};

function setCache(clas, we, $cache) {
  $cache.forEach(value => {
    let cache = value.get(we);
    if (cache) {
      cache.ones(clas);
    } else {
      value.set(we, [clas]);
    }
  });
}

function insertion(nodes, node) {
  try {
    farEach(nodes, child => {
      if (child.node && child.node.parentNode) {
        node = child.node;
        child.node = null;
        return node;
      }      node = insertion(child.childNodes);
    });
    return node;
  } catch (error) {
    console.error(error);
  }
}

function insertNode(nodes, node) {
  try {
    farEach(nodes, child => {
      if (child.node && child.node.parentNode) {
        node = child.node;
        return node;
      }
      if (child.childNodes.length) {
        let children = child.childNodes[child.childNodes.length - 1];
        if (children.node && children.node.parentNode) {
          node = children.node;
          return node;
        }
        node = insertNode([children]);
      }
    });
    return node;
  } catch (error) {
    console.error(error);
  }
}

function clearNodes(nodes) {
  nodes.forEach(function (child) {
    if (child.node && child.node.parentNode)
      return child.node.parentNode.removeChild(child.node);
    if (child.childNodes)
      clearNodes(child.childNodes);
  });
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

function createNode(template) {
  if (new RegExp($html).test(template)) {
    let list = template.match($attr);
    let element = document.createElement(list.shift());
    list.forEach(attr => {
      try {
        let name = attr.replace($attr, "$1");
        let value = attr.replace($attr, "$3");
        element.setAttribute(name, value);
      } catch (error) {
      }
    });
    return element;
  } else {
    let range = document.createRange();
    let element = range.createContextualFragment(template);
    return element.firstChild;
  }
}

function addListener(type, methods, scope) {
  if (this.addEventListener) {
    this.addEventListener(type, function (event) {
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
    farEach(slice(this.childNodes), function (child) {
      child.parentNode.removeChild(child);
    });
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
    farEach(this, function (node) {
      node.on(type, call);
    });
    return this;
  },
  off(type, call) {
    farEach(this, function (node) {
      node.off(type, call);
    });
    return this;
  }
});

function init(dom) {
  let text = dom.outerHTML;
  text = text.replace($lang, tag => "######".concat(tag.trim(), "######"));
  let list = text.split("######");
  return list;
}

function initCompiler(list, children) {
  whiles(list, child => {
    if (child.trim() == "") return;
    if (new RegExp($close).test(child)) return true;
    let item = { clas: createNode(child), children: [], action: new Map() };
    children.push(item);
    if (new RegExp($html).test(child)) {
      if (new RegExp($close).test(item.clas.outerHTML)) {
        initCompiler(list, item.children);
      }
      child = child.replace($eash, (express) => {
        express = express.replace($eash, "@each($3){");
        let index = children.indexOf(item);
        let each = { clas: createNode(express), children: [item] };
        children.splice(index, 1, each);
        return "";
      });
      child = child.replace($id, (express) => {
        let name = express.replace($id, "$1");
        let value = express.replace($id, "$3");
        Reflect.set(item, name, value);
        return "";
      });
      child = child.replace($event, (express) => {
        let name = express.replace($event, "$1");
        let value = express.replace($event, "$3");
        item.action.set(name, value);
        return "";
      });
    }
    else if (new RegExp($chen).test(child)) {
      initCompiler(list, item.children);
      if (new RegExp($whea).test(child)) {
        let index = children.indexOf(item);
        let when = { clas: createNode("@when{"), children: [item] };
        children.splice(index, 1, when);
      } else if (new RegExp($whec).test(child)) {
        let when = children[children.length - 2];
        when.children.push(children.pop());
      }
    }
  });
  return children;
}

function observer(target, call, watch) {
  if (typeof target != 'object') return target;
  target = new Proxy(target, handler());

  function handler(root) {
    let values = new Map(), caches = new Map();
    return {
      get(parent, prop, proxy) {
        if (prop == "$target") return parent;
        if (!parent.hasOwnProperty(prop) && Reflect.has(parent, prop)) return Reflect.get(parent, prop);
        let path = root ? `${root}.${prop}` : prop;
        global.$cache.delete(root);
        global.$cache.set(path, caches.get(prop));
        mq.publish(target, "get", [path]);
        let value = values.get(prop);
        if (value != undefined) return value;

        value = Reflect.get(parent, prop);
        if (check(value)) value = new Proxy(value, handler(path));
        values.set(prop, value);
        caches.set(prop, new Map());
        global.$cache.delete(root);
        global.$cache.set(path, caches.get(prop));
        array(value, caches.get(prop));
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
        setValue(value, oldValue);
        let path = root ? `${root}.${prop}` : prop;
        mq.publish(target, "set", [new Map([[path, oldCache]]), new Map([[path, caches.get(prop)]])]);
        mq.publish(target, path, [value, oldValue]);
        return true;
      }
    }
  }

  function setValue(object, oldObject) {
    if (object instanceof Component) return;
    if (typeof object == "object" && typeof oldObject == "object") {
      Object.keys(oldObject).forEach(prop => {
        global.$cache = new Map();
        let value = object[prop], cache = global.$cache;
        global.$cache = new Map();
        let oldValue = oldObject[prop], oldCache = global.$cache;
        if (typeof value != "object" && typeof oldValue != "object") mq.publish(target, "set", [oldCache, cache]);
        setValue(value, oldValue);
      });
    }
  }

  function check(value) {
    if (value instanceof Component) return;
    if (value instanceof Date) return;
    if (typeof value == "object") return value;
  }

  Object.keys(call).forEach(key => mq.subscribe(target, key, call[key]));
  Object.keys(watch || {}).forEach(key => mq.subscribe(target, key, watch[key]));

  return target;
}

function array(object, cache) {
  if (!Array.isArray(object)) return;
  let methods = {
    shift() {
      var method = Array.prototype.shift;
      let data = method.apply(this, arguments);
      let index = this.length;
      cacher(cache, index);
      return data;
    },
    pop() {
      var method = Array.prototype.pop;
      let data = method.apply(this, arguments);
      let index = this.length;
      cacher(cache, index);
      return data;
    },
    splice() {
      var method = Array.prototype.splice;
      if (this.length) {
        let index = this.length;
        let data = method.apply(this, arguments);
        arguments.length > 2 ? this.index = index : index = this.length;
        cacher(cache, index, arguments.length - 2);
        Reflect.deleteProperty(this, "index");
        return data;
      }
    },
    unshift() {
      var method = Array.prototype.unshift;
      if (arguments.length) {
        let index = this.index = this.length;
        let data = method.apply(this, arguments);
        cacher(cache, index, arguments.length);
        Reflect.deleteProperty(this, "index");
        return data;
      }
    },
    push() {
      var method = Array.prototype.push;
      if (arguments.length) {
        let index = this.index = this.length;
        let data = method.apply(this, arguments);
        cacher(cache, index, arguments.length);
        Reflect.deleteProperty(this, "index");
        return data;
      }
    },
    reverse() {
      var method = Array.prototype.reverse;
      let data = method.apply(this, arguments);
      return data;
    },
    sort() {
      var method = Array.prototype.sort;
      let data = method.apply(this, arguments);
      return data;
    }
  };
  Reflect.setPrototypeOf(methods, Array.prototype);
  Reflect.setPrototypeOf(object, methods);
}

class Mess {
  constructor() {
    this.map = new Map();
  }
  publish(scope, event, data) {
    const cache = this.map.get(scope);
    if (cache) {
      let action = cache.get(event);
      if (action) {
        action.data.push(data);
      }
      else {
        cache.set(event, { data: [data], queue: [] });
      }
    }
    else {
      let data = new Map();
      data.set(event, { data: [data], queue: [] });
      this.map.set(scope, data);
    }
    this.notify(cache.get(event), scope);
  }

  notify(action, scope) {
    if (action) {
      while (action.data.length) {
        const data = action.data.shift();
        action.queue.forEach(function (call) {
          call.apply(scope, data);
        });
      }
    }
    else {
      this.map.forEach(function (cache) {
        cache.forEach(function (action) {
          while (action.data.length) {
            const data = action.data.shift();
            action.queue.forEach(function (call) {
              call.apply(scope, data);
            });
          }
        });
      });
    }
  }

  subscribe(scope, event, call) {
    const cache = this.map.get(scope);
    if (cache) {
      const action = cache.get(event);
      if (action) {
        action.queue.push(call);
      }
      else {
        cache.set(event, { data: [], queue: [call] });
      }
    }
    else {
      let data = new Map();
      data.set(event, { data: [], queue: [call] });
      this.map.set(scope, data);
    }
  }
}

var mq = new Mess();

function Router(app, params) {
  var $param = /^:/, $root = /^\/(.+)/;
  let router, para, routes;
  this.redreact = redreact;

  var supportsPushState = (function () {
    var userAgent = window.navigator.userAgent;
    if (
      (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1) ||
      (userAgent.indexOf("Trident") > -1) ||
      (userAgent.indexOf("Edge") > -1)
    ) {
      return false
    }
    return window.history && 'pushState' in window.history
  })();

  function resolver(hash) {
    routes = Object.keys(params);
    while (routes.length) {
      router = routes.shift(), para = {};
      let routs = router.replace($root, "$1");
      routs = routs.split("/");
      let haths = hash.split("/");

      if (match(routs, haths)) return {
        component: params[router].component,
        router: params[router].router,
        action: params[router].action,
        after: params[router].after,
        params: para,
        path: hash
      }
    }
  }

  function match(routs, hashs) {
    while (hashs.length) {
      let name = routs.shift();
      let param = hashs.shift();
      if (param != name) {
        if (!$param.test(name)) {
          return false;
        }
        name = name.replace($param, "");
        para[name] = param;
      }
    }
    return true;
  }

  function redreact(path) {
    let url = window.location.pathname;
    window.location.href = url + "#" + path;
  }

  function action(event) {
    var hash = window.location.hash.replace(/^#\/?/, "");
    let router = resolver(hash);
    if (router) {
      router.action(router.params);
      app.ref[router.router] = router.component;
      if (router.after) {
        router.after();
      }
    } else {
      if (event == undefined || event.type == "load") {
        redreact("");
      }
    }
  }

  window.addEventListener("load", action, action());
  window.addEventListener(supportsPushState ? "popstate" : "hashchange", action, false);

}

let global = { $path: undefined };

class View {
  constructor(app) {
    this.model = observer(app.model, watcher);
    this.action = app.action;
    this.watch = app.watch;
    this.filter = app.filter;
    this.component = {};
    this.componenter(app.component);
    this.creater(app);
  }
  creater(app) {
    this.content = { childNodes: [], children: [] };
    this.view = query(app.view)[0];
    this.ref = setRef(this.content, this);
    let node = initCompiler(init(this.view), [])[0];
    setScopes(this);
    resolver.view(this.view, node, this.model, this.content, this);
  }
  componenter(coms) {
    let list = Object.values(coms || {});
    list.forEach(com => {
      let name = com.name.toLowerCase();
      Reflect.set(this.component, name, com);
    });
  }
}

let watcher = {
  set(cache, newCache) {
    deepen(cache, newCache);
  },
  get(path) {
    global.$path = path;
  }
};

function setRef(content, we) {
  return new Proxy({}, {
    get(parent, prop) {
      let childNodes = content.childNodes;
      let list = getRef(childNodes, prop, []);
      let node = list.shift();
      return node.childNodes[1];
    },
    set(parent, prop, app) {
      let childNodes = content.childNodes;
      let list = getRef(childNodes, prop, []);
      let node = list.shift();
      resolver.component(new app(), node, we);
      return true;
    }
  })
}

function getRef(nodes, id, list) {
  nodes.every(function (child) {
    if (child["@".concat(id)]) {
      list.push(child);
      return false;
    }
    if (child.childNodes)
      getRef(child.childNodes, id, list);
    return !list.length;
  });
  return list;
}

class Component$1 {
  constructor(app) {
    this.model = app.model;
    this.action = app.action;
    this.watch = app.watch;
    this.filter = app.filter;
    this.creater(app);
  }
  creater(app) {
    this.content = { childNodes: [], children: [] };
    let view = query(app.view)[0];
    view.parentNode.removeChild(view);
    this.view = view.outerHTML;
  }
}

function clearNode(nodes, status) {
  try {
    nodes.every(child => {
      if (child.node) {
        let node = child.node.ownerElement || child.node;
        status = document.body.contains(node);
        return false;
      }      status = clearNode(child.childNodes);
    });
    return status;
  } catch (error) {
    console.error(error);
  }
}

function deepen(cache, newCache) {
  if (cache && newCache) {
    cache.forEach(caches => {
      if (!caches) return;
      caches.forEach((nodes, we) => {
        slice(nodes).forEach(node => {
          if (clearNode([node]))
            resolver[node.resolver](node, we, newCache);
          else
            nodes.remove(node);
        });
      });
    });
  } else if (cache && !newCache) {
    cache.forEach(caches => {
      if (!caches) return;
      caches.forEach(nodes => {
        clearNodes(nodes);
      });
    });
  }
}

window.View = View;
window.Component = Component$1;
window.Router = Router;
window.query = query;

export { Component$1 as Component, View, global };
