function whiles(obj, method, me) {
  while (obj.length) {
    var data = obj[0];
    if (method.call(me, data, obj))
      break;
  }
}

function each(obj, method, arg) {
  if (!obj) return;
  arg = arg || obj;
  Object.keys(obj).every(i => {
    var data = obj[i];
    return !method.call(data, data, i, arg);
  });
  return arg;
}

function forEach(obj, method, me) {
  if (!obj) return;
  if (obj.hasOwnProperty("$index")) {
    for (let i = obj.$index; i < obj.length; i++) {
      method.call(me, obj[i], i);
    }
  } else {
    Object.keys(obj).forEach(i => {
      method.call(me, obj[i], i);
    });
  }
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

var $lang = /(@each|@when|\.when)\s*\((.*)\)\s*\{|\.when\s*\{|\{([^\{\}]*)\}|\}/g;
var $chen = /(@each|@when|\.when)\s*\((.*)\)\s*\{|\.when\s*\{/;
var $each = /(@each)\s*\((.*)\)\s*\{/g;
var $when = /(@when|\.when)\s*\((.*)\)\s*\{|\.when\s*\{/g;
var $whec = /\.when\s*\((.*)\)\s*\{|\.when\s*\{/g;
var $whea = /@when/g;
var $express = /\{\s*@?([^\{\}]*)\}/;
var $expres = /\{([^\{\}]*)\}/g;
var $component = /\{\s*@([^\{\}]*)\}/;
var $close = /^\}$/;
var $word = $word = /(["'][^"']*["'])|(([_\$a-zA-Z]+\w?)((\.\w+)|(\[(.+)\]))*)/g;
var $event = /^@(.*)/;

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
    _express = `'${_express.replace($expres, "'+($1)+'")}'`;
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
      word.match(/["']/) ? word : "scope.".concat(word)
    ));

  return new Function('scope',
    `return ${express};`
  )(scope);
}

function Path(path) {
  try {
    return path.replace(/(\w+)\.?/g, "['$1']");
  } catch (error) {
    console.warn(error);
    return undefined;
  }
}

function setVariable(scope, variable, path) {
  path = `${Path(path)}`;
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

function handler(proto) {
  return {
    get(parent, prop, proxy) {
      if (prop == Symbol.unscopables) return;
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

function setScopes(we) {
  let action = { $view: we.view, $model: we.model, $action: we.action, $watch: we.watch };
  we.action = we.action || {};
  Reflect.setPrototypeOf(action, Function.prototype);
  Object.values(we.action).forEach(method => Reflect.setPrototypeOf(method, action));

  let filter = Object.assign({}, action);
  we.filter = we.filter || {};
  Reflect.setPrototypeOf(we.filter, filter);
}

function Compiler(node, scopes, childNodes, content, we) {

  function compiler(node, scopes, childNodes, content) {
    whiles(childNodes, function (child, childNodes) {
      if (child.clas.nodeType == 1) {
        if (child.clas.hasAttribute("@each")) {
          var expreses = child.clas.getAttribute("@each").split(":");
          var variable = expreses.shift().trim();
          var source = expreses.pop().trim();
          var id = expreses.shift();
          var dataSource = code(source, scopes);
          var clas = eachNode(null, node, child);
          content.childNodes.push(clas);
          binding.attrEach(null, scopes, clas, content, dataSource);
          forEach(dataSource, function (item, index) {
            var scope = Object.create(scopes.$target);
            if (id) scope[id.trim()] = index;
            scope = new Proxy(scope, handler(scopes));
            setVariable(scope, variable, global.$path);
            var newNode = child.clas.cloneNode();
            newNode.removeAttribute("@each");
            node.appendChild(newNode);
            var clasNodes = classNode(newNode, child);
            clas.childNodes.push(clasNodes);
            compiler(newNode, scope, slice(child.children), clasNodes);
            commom(newNode, scope, clasNodes, content);
          });
        }
        else {
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
            compiler(newNode, scopes, slice(child.children), clasNodes);
            commom(newNode, scopes, clasNodes, content);
          }
        }
      }
      else {
        if ($each.test(child.clas.nodeValue)) {
          var expreses = child.clas.nodeValue.replace($each, "$2").split(":");
          var variable = expreses.shift().trim();
          var source = expreses.pop().trim();
          var id = expreses.shift();
          var dataSource = code(source, scopes);
          var clas = eachNode(null, node, child);
          content.childNodes.push(clas);
          binding.each(null, scopes, clas, content, dataSource);
          let children = slice(child.children);
          forEach(dataSource, function (item, index) {
            var scope = Object.create(scopes.$target);
            if (id) scope[id.trim()] = index;
            scope = new Proxy(scope, handler(scopes));
            setVariable(scope, variable, global.$path);
            var clasNodes = classNode(null, child);
            clas.childNodes.push(clasNodes);
            compiler(node, scope, slice(children), clasNodes);
          });
        }
        else if ($when.test(child.clas.nodeValue)) {
          var when = code(child.clas.nodeValue.replace($when, "$2"), scopes);
          var clas = whenNode(null, node, child, content, scopes);
          clas.children.push(childNodes.shift());
          if (when) {
            binding.when(null, scopes, clas, content);
            whiles(childNodes, function (child, childNodes) {
              if (!whem(child)) return true;
              clas.children.push(childNodes.shift());
            });
            whiles(slice(child.children), function (child, childNodes) {
              if (child.clas.nodeType == 1 || $chen.test(child.clas.nodeValue)) {
                compiler(node, scopes, childNodes, clas);
              }
              else {
                var newNode = child.clas.cloneNode();
                node.appendChild(newNode);
                var clasNodes = classNode(newNode, child);
                clas.childNodes.push(clasNodes);
                commom(newNode, scopes, clasNodes, clas);
              }
              childNodes.shift();
            });
          }
          else if (when == undefined) {
            binding.when(null, scopes, clas, content);
            whiles(slice(child.children), function (child, childNodes) {
              if (child.clas.nodeType == 1 || $chen.test(child.clas.nodeValue)) {
                compiler(node, scopes, childNodes, clas);
              }
              else {
                var newNode = child.clas.cloneNode();
                node.appendChild(newNode);
                var clasNodes = classNode(newNode, child);
                clas.childNodes.push(clasNodes);
                commom(newNode, scopes, clasNodes, clas);
              }
              childNodes.shift();
            });
          }
          else if (whem(childNodes[0])) {
            compiler(node, scopes, childNodes, clas);
          }
          return whem(child);
        }
        else {
          var newNode = child.clas.cloneNode();
          node.appendChild(newNode);
          var clasNodes = classNode(newNode, child);
          content.childNodes.push(clasNodes);
          commom(newNode, scopes, clasNodes, content);
        }
      }
      childNodes.shift();
    });
  }

  function attrExpress(node, scope) {
    forEach(node.attributes, function (child) {
      if (!child) return;
      let clas = attrNode(child, scope, child.cloneNode());
      if (clas.clas.name == ":model") {
        model(child, scope);
      }
      else if (new RegExp($expres).test(child.nodeValue)) {
        if (clas.clas.name == "value") model(child, scope);
        child.nodeValue = codex(child.nodeValue, scope, we);
        binding.attrExpress(child, scope, clas);
      }
      bind(child, scope);
    });

    function bind(node, scope) {
      node.name.replace($event, function (key) {
        key = key.replace($event, "$1");
        let owner = node.ownerElement;
        var array = node.nodeValue.toString().match(/\(([^)]*)\)/);
        if (array) {
          var name = node.nodeValue.toString().replace(array[0], "");
          let method = code(name, we.action);
          owner.on(key, method, scope, array[1]);
        }
        else {
          let method = code(node.nodeValue, we.action);
          owner.on(key, method, scope);
        }
      });
    }
  }

  function commom(node, scope, clas, content) {
    let express;
    attrExpress(node, scope);
    if (new RegExp($component).test(node.nodeValue)) {
      comNode(node, scope, clas, content);
      resolver["component"](clas, we);
    }
    else if (express = new RegExp($expres).exec(node.nodeValue)) {
      node.nodeValue = codeo(express[1], scope, we);
      binding.express(node, scope, clas);
    }
  }

  function whem(child) {
    if (child) return new RegExp($whec).test(child.clas.nodeValue);
  }

  let binding = {
    attrEach(node, scope, clas, content) {
      if (global.$cache == undefined) return;
      clas.resolver = "each";
      clas.content = content;
      clas.scope = scope;
      clas.node = node;
      setCache(clas, we, global.$cache);
    },
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
      var nodeValue = clas.clas.nodeValue;
      let whens = new RegExp($when).exec(nodeValue);
      if (!whens) return;
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
    },
    attrExpress(node, scope, clas) {
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
    let _express = `scope${Path(owner._express)}`;
    let method = (input[owner.type] || input[owner.localName] || input.other);
    method(node, scope, _express);
  }

  let input = {
    checkbox(node, scope, _express) {
      try {
        var owner = node.ownerElement;
        owner.on("change", function () {
          let _value = owner.value.replace(/(\'|\")/g, "\\$1");
          let express = `${_express}.${owner.checked ? "ones" : "remove"}('${_value}');`;
          new Function('scope', express)(scope);
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
      node: newNode,
      clas: child.clas,
      children: child.children,
      scope: child.scope,
      childNodes: []
    };
  }

  function eachNode(newNode, node, child) {
    var comment = document.createComment("each:" + global.$path);
    node.appendChild(comment);
    return {
      node: newNode,
      clas: child.clas,
      children: child.children,
      scope: child.scope,
      childNodes: [{
        node: comment,
        clas: child.clas,
        scope: child.scope,
        children: [],
        childNodes: []
      }]
    };
  }

  function whenNode(newNode, node, child, content, scopes) {
    if (new RegExp($whea).test(child.clas.nodeValue)) {
      var comment = document.createComment("when:" + global.$path);
      node.appendChild(comment);
      content.childNodes.push(content = {
        node: newNode,
        clas: child.clas,
        children: [],
        scope: child.scope,
        content: content,
        childNodes: [{
          node: comment,
          clas: child.clas,
          scope: child.scope,
          children: [],
          childNodes: []
        }]
      });
      binding.when(null, scopes, content);
    }
    return content;
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
  var comment = document.createComment("component:" + child.path);
  Reflect.deleteProperty(child, "path");
  node.before(comment);
  component.content.node = component.view;
  return {
    clas: child.clas,
    children: [component.node],
    scope: child.scope,
    resolver: child.resolver,
    content: child.content,
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
  component: function (node, we) {
    try {
      global.$cache = new Map();
      let app = codeo(node.clas.nodeValue, node.scope, we);
      app.model = app.model.$target || app.model;
      let $cache = global.$cache;
      node.path = global.$path;
      if (blank(app)) return;
      Reflect.setPrototypeOf(app.model, node.scope.$target);
      var insert = insertion(node.childNodes);
      var childNodes = node.content.childNodes;
      clearNodes(node.childNodes);
      let component = new View$1({ view: app.component, model: app.model, action: app.action }, node.scope);
      app.model = component.model;
      let clasNodes = compoNode(insert, node, component);
      setCache(clasNodes, we, $cache);
      childNodes.replace(node, clasNodes);
      if (insert.parentNode)
        insert.parentNode.replaceChild(component.view, insert);
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
      new Compiler(doc, node.scope, slice(node.children), node.content, we);
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
  arrayEach: function (node, we, index, nodes) {
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
        resolver.arrayEach(node, we, index, children);
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
    each(nodes, child => {
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
    each(nodes, child => {
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

function init(dom) {
  each(dom, function (node) {
    if (node.childNodes[0] && !(/(CODE|SCRIPT)/).test(node.nodeName))
      init(slice(node.childNodes));
    if (node.nodeType == 3)
      node.nodeValue.replace($lang, function (tag) {
        var nodes = node.nodeValue.split(tag);
        node.parentNode.insertBefore(document.createTextNode(nodes[0]), node);
        node.parentNode.insertBefore(document.createTextNode(tag.trim()), node);
        node.nodeValue = node.nodeValue.replace(nodes[0], "").replace(tag, "");
      });
  });
  return dom;
}

function initCompiler(node, children) {
  let list = children || [];
  whiles(node, function (child) {
    node.shift();
    if (new RegExp($close).test(child.nodeValue)) return true;
    var item = { clas: child.cloneNode(true), children: [] };
    if (!(child.nodeType == 3 && child.nodeValue.trim() == "")) list.push(item);
    if (child.nodeType == 1) {
      initCompiler(slice(child.childNodes), item.children);
    }
    else if (new RegExp($chen).test(child.nodeValue)) {
      initCompiler(node, item.children);
    }  });
  return list;
}

function observer(target, proto, call, watch) {
  if (typeof target != 'object') return target;
  target = new Proxy(target, handler());

  function handler(root) {
    let values = new Map(), cache = new Map();
    return {
      get(parent, prop, proxy) {
        if (prop == "$target") return parent;
        let method = array(proxy, prop, root);
        if (method) return method;
        if (!parent.hasOwnProperty(prop) && Reflect.has(proto, prop)) return Reflect.get(proto, prop);
        if (!parent.hasOwnProperty(prop)) return parent[prop];
        let path = root ? `${root}.${prop}` : prop;
        let value = getValue(values, cache, parent, prop, path);
        global.$cache.delete(root);
        global.$cache.set(path, cache.get(prop));
        mq.publish(target, "get", [path]);
        return value;
      },
      set(parent, prop, val, proxy) {
        if (!parent.hasOwnProperty(prop) && Reflect.has(proto, prop)) return Reflect.set(proto, prop, val);
        let oldValue = values.get(prop);
        let oldCache = cache.get(prop);
        values.set(prop, undefined);
        cache.set(prop, new Map());
        Reflect.set(parent, prop, val.$target || val);
        let value = proxy[prop];
        setValue(value, oldValue);
        let path = root ? `${root}.${prop}` : prop;
        mq.publish(target, "set", [new Map([[path, oldCache]]), new Map([[path, cache.get(prop)]])]);
        mq.publish(target, path, [value, oldValue]);
        return true;
      }
    }
  }

  function getValue(values, cache, parent, prop, path) {
    let value = values.get(prop);
    if (value != undefined) return value;
    cache.set(prop, new Map());
    value = Reflect.get(parent, prop);
    if (!(value instanceof View) && typeof value == "object") {
      value = new Proxy(value, handler(path));
    }
    values.set(prop, value);
    return value;
  }

  function setValue(object, oldObject) {
    if (object instanceof View) return;
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

  function array(object, name, root) {
    if (!Array.isArray(object)) return;
    const meths = {
      shift() {
        var method = Array.prototype.shift;
        let data = method.apply(this, arguments);
        let index = this.length;
        cacher(getCache(), index);
        return data;
      },
      pop() {
        var method = Array.prototype.pop;
        let data = method.apply(this, arguments);
        let index = this.length;
        cacher(getCache(), index);
        return data;
      },
      splice() {
        var method = Array.prototype.splice;
        if (this.length) {
          let index = this.length;
          let data = method.apply(this, arguments);
          arguments.length > 2 ? this.$index = index : index = this.length;
          cacher(getCache(), index, arguments.length - 2);
          Reflect.deleteProperty(this, "$index");
          return data;
        }
      },
      unshift() {
        var method = Array.prototype.unshift;
        if (arguments.length) {
          let index = this.$index = this.length;
          let data = method.apply(this, arguments);
          cacher(getCache(), index, arguments.length);
          Reflect.deleteProperty(this, "$index");
          return data;
        }
      },
      push() {
        var method = Array.prototype.push;
        if (arguments.length) {
          let index = this.$index = this.length;
          let data = method.apply(this, arguments);
          cacher(getCache(), index, arguments.length);
          Reflect.deleteProperty(this, "$index");
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
    Reflect.setPrototypeOf(meths, object);
    function getCache() {
      global.$cache = new Map();
      new Function('scope',
        `
        return scope${Path(root)};
        `
      )(target);
      return global.$cache.get(root);
    }
    return meths[name];
  }

  Object.keys(call).forEach(key => mq.subscribe(target, key, call[key]));
  Object.keys(watch || {}).forEach(key => mq.subscribe(target, key, watch[key]));

  return target;
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
      app.model[router.router] = router.component;
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
    this.attachEvent('on' + type, function (event) {
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
    element['on' + type] = function (event) {
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
    this.detachEvent('on' + type, handler);
  }
  else {
    element['on' + type] = null;
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
    each(slice(this.childNodes), function (child) {
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
    each(this, function (node) {
      node.on(type, call);
    });
    return this;
  },
  off(type, call) {
    each(this, function (node) {
      node.off(type, call);
    });
    return this;
  }
});

let global = { $path: undefined };

class View$1 {
  constructor(app, parent) {
    this.content = { childNodes: [], children: [] };
    this.model = app.model;
    this.action = app.action;
    this.watch = app.watch;
    this.filter = app.filter;
    app.view ? this.view(app, parent || {}) : this.component(app);
  }
  view(app, parent) {
    app.model = observer(app.model, parent, {
      set(cache, newCache) { deepen(cache, newCache); },
      get(path) { global.$path = path; }
    }, app.watch);

    this.model = app.model;
    var view = query(app.view);
    var node = initCompiler(init(slice(view)))[0];
    this.node = node;
    this.view = view[0];
    setScopes(this);
    resolver.view(this.view, node, app.model, this.content, this);
  }
  component(app) {
    var view = query(app.component);
    this.view = view[0];
    this.view.parentNode.removeChild(this.view);
    this.component = this.view.outerHTML;
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

window.View = View$1;
window.Router = Router;
window.query = query;

export { View$1 as View, global };
