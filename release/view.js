var view = (function (exports) {
  'use strict';

  var $lang = /((@each|@when|\.when)\s*\((.*)\)\{|\{\s*\{([^\{\}]*)\}\s*\}|\s*\}\s*|\.when\s*\{)/g;
  var $chen = /(@each|@when|\.when)\s*\((.*)\)\{|\.when\s*\{/;
  var $each = /(@each)\s*\((.*)\)\{/g;
  var $when = /(@when|\.when)\s*\((.*)\)\{|\.when\s*\{/g;
  var $whec = /\.when\s*\((.*)\)\{|\.when\s*\{/g;
  var $whea = /@when/g;
  var $express = /\{\s*\{@?([^\{\}]*)\}\s*\}/;
  var $expres = /\{\s*\{([^\{\}]*)\}\s*\}/g;
  var $component = /\{\s*\{\s*@([^\{\}]*)\}\s*\}/;
  var $close = /(^\s*\}\s*$)/;
  var $word = /(\w+)((\.\w+)|(\[(.+)\]))*/g;

  function code(_express, _scope) {
    try {
      global.$path = undefined;
      _express = _express.replace($express, "$1");
      return Code(_express)(_scope);
    } catch (e) {
      return undefined;
    }
  }

  function codex(_express, _scope) {
    try {
      _express = "'" + _express.replace($expres, "'+($1)+'") + "'";
      return Code(_express)(_scope);
    } catch (e) {
      return undefined;
    }
  }

  function Code(_express) {
    return new Function('_scope',
      `with (_scope) {
		  return `+ _express + `;
		}`
    );
  }

  function Path(path) {
    try {
      return path.replace(/(\w+)\.?/g, "['$1']");
    } catch (e) {
      return undefined;
    }
  }

  function setVariable(scope, variable, path) {
    Object.defineProperty(scope, variable, {
      get() {
        return new Function('scope',
          `
        return scope`+ Path(path) + `;
        `
        )(scope);
      },
      set(val) {
        new Function('scope', 'val',
          `
        scope`+ Path(path) + `=val;
        `
        )(scope, val);
      }
    });
  }

  function observe(target, callSet, callGet) {
    var setable = true;
    function watcher(object, root, oldObject) {
      if (Array.isArray(object)) {
        array(object, root);
        for (var prop = 0; prop < object.length; prop++) {
          if (object.hasOwnProperty(prop)) {
            walk(object, prop, root, oldObject);
          }
        }
      } else if (typeof object == "object") {
        for (var prop in object) {
          if (object.hasOwnProperty(prop)) {
            walk(object, prop, root, oldObject);
          }
        }
      }
    }

    function walk(object, prop, root, oldObject) {
      var value = object[prop], oldValue = (oldObject || {})[prop];
      var path = root ? root + "." + prop : prop;
      if (!(value instanceof View) && typeof value == "object") {
        watcher(value, path, oldValue);
      }
      define(object, prop, path, oldValue);
    }

    function define(object, prop, path, oldValue) {
      var value = object[prop];
      Object.defineProperty(object, prop, {
        get() {
          mq.publish(target, "get", [path]);
          return value;
        },
        set(val) {
          var oldValue = value;
          watcher(value = val, path, oldValue);
          if (setable) mq.publish(target, "set", [path]);
        }
      });
    }

    function def(obj, key, val) {
      Object.defineProperty(obj, key, {
        writable: true,
        value: val
      });
    }

    function array(object, root) {
      const meths = ["shift", "push", "pop", "splice", "unshift", "reverse"];
      var prototype = Array.prototype;
      meths.forEach(function (name) {
        var method = prototype[name];
        switch (name) {
          case "shift":
            def(object, name, function () {
              setable = false;
              var data = method.apply(this, arguments);
              setable = true;
              notify([0]);
              return data;
            });
            break;
          case "pop":
            def(object, name, function () {
              var data = method.apply(this, arguments);
              notify([this.length]);
              return data;
            });
            break;
          case "splice":
            def(object, name, function (i, l) {
              setable = false;
              var data = method.apply(this, arguments);
              var params = [], m = new Number(i) + new Number(l);
              while (i < m) params.push(i++);
              setable = true;
              notify(params);
              return data;
            });
            break;
          case "push":
            def(object, name, function (i) {
              var data = method.call(this, i);
              notify([]);
              return data;
            });
            break;
          default:
            def(object, name, function () {
              setable = false;
              var data = method.apply(this, arguments);
              notify([]);
              return data;
            });
            break;
        }
      });
      function notify(parm) {
        new Function('scope', 'val',
          `
        scope`+ Path(root) + `=val;
        `
        )(target, object);
      }
    }

    mq.subscribe(target, "set", callSet);
    mq.subscribe(target, "get", callGet);

    watcher(target);
  }

  class Mess extends Map {
    publish(scope, event, data) {
      const cache = this.get(scope);
      if (cache) {
        let action = cache.get(event);
        if (action) {
          action.data.push(data);
        } else {
          cache.set(event, { data: [data], queue: [] });
        }
      } else {
        let data = new Map();
        data.set(event, { data: [data], queue: [] });
        this.set(scope, data);
      }
      this.notify(cache.get(event));
    }

    notify(action) {
      if (action) {
        while (action.data.length) {
          const data = action.data.shift();
          action.queue.forEach(function (call) {
            call(data[0], data[1], data[2]);
          });
        }
      } else {
        this.forEach(function (cache) {
          cache.forEach(function (action) {
            while (action.data.length) {
              const data = action.data.shift();
              action.queue.forEach(function (call) {
                call(data[0], data[1], data[2]);
              });
            }
          });
        });
      }
    }

    subscribe(scope, event, call) {
      const cache = this.get(scope);
      if (cache) {
        const action = cache.get(event);
        if (action) {
          action.queue.push(call);
        } else {
          cache.set(event, { data: [], queue: [call] });
        }
      } else {
        let data = new Map();
        data.set(event, { data: [], queue: [call] });
        this.set(scope, data);
      }
    }
  }

  var mq = new Mess();

  function each(obj, arg, callback) {
    if (!obj) return;
    var methd = arguments[2] || arguments[1];
    var args = arguments[2] ? arg : obj;
    if (Array.isArray(obj)) {
      var length = obj.length;
      for (var i = 0; i < length; i++) {
        if (obj.length != length) {
          i = i - length + obj.length; length = obj.length;
        }
        if (obj.hasOwnProperty(i)) {
          var data = obj[i];
          if (methd.call(data, data, i, args))
            break;
        }
      }
    } else {
      for (var i in obj)
        if (obj.hasOwnProperty(i)) {
          var data = obj[i];
          if (methd.call(data, data, i, args))
            break;
        }
    }
    return args;
  }

  function slice(obj) {
    return each(obj, [], function (node, i, list) {
      list.push(this);
    });
  }

  function extention(object, parent) {
    object.__proto__ = parent;
    return object;
  }

  function extend(object, src) {
    var prototype = object.prototype || object.__proto__;
    for (var key in src) {
      prototype[key] = src[key];
    }
    return object;
  }

  function blank(str) {
    return str == null || str == undefined || str == "";
  }

  function clone(value) {
    if (Array.isArray(value)) {
      return value.map(clone);
    }
    if (value && typeof value === 'object') {
      const obj = {};
      for (const key in value) {
        obj[key] = clone(value[key]);
      }
      return obj;
    }
    return value;
  }

  extend(Array, {
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
    has(o) {
      var index = this.indexOf(o);
      if (index > -1)
        return true;
      return false
    }
  });

  function query(express) {
    try {
      var doc = document.querySelectorAll(express);
      return doc;
    } catch (e) {
      var newNode = document.createElement("div");
      newNode.innerHTML = express.trim();
      return newNode.childNodes;
    }
  }

  extend(Node, {
    on(type, methd) {
      this.addEventListener(type, methd);
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
  });

  extend(NodeList, {
    on(type, call) {
      each(this, function (node) {
        node.on(type, call);
      });
    },
    off(type, call) {
      each(this, function (node) {
        node.off(type, call);
      });
    }
  });

  function init(dom) {
    each(dom, function (node) {
      if (node.childNodes[0] && node.nodeName != "SCRIPT")
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
    return each(node, children || [], function (child, i, list) {
      node.shift();
      if (new RegExp($close).test(child.nodeValue)) return true;
      var item = { clas: child.cloneNode(true), children: [] };
      if (!(child.nodeType == 3 && child.nodeValue.trim() == ""))
        list.push(item);
      switch (child.nodeType) {
        case 1:
          initCompiler(slice(child.childNodes), item.children);
          break;
        default:
          child.nodeValue.replace($chen, function () {
            initCompiler(node, item.children);
          });
          break;
      }  });
  }

  function compiler(node, scopes, childNodes, content, attributes) {
    each(childNodes, function (child, index, childNodes) {
      switch (child.clas.nodeType) {
        case 1:
          if (child.clas.hasAttribute("each")) {
            var expreses = child.clas.getAttribute("each").split(":");
            var variable = expreses.shift().trim(), source = expreses.pop().trim(), id = expreses.shift();
            var dataSource = code(source, scopes);
            var clas = eachNode(null, node, child);
            content.childNodes.push(clas);
            binding(null, scopes, clas, content, attributes);
            each(dataSource, function (item, index) {
              var scope = Object.create(scopes || {});
              setVariable(scope, variable, global.$path);
              if (id) scope[id.trim()] = index.toString();
              var newNode = child.clas.cloneNode();
              newNode.removeAttribute("each");
              node.appendChild(newNode);
              var clasNodes = classNode(newNode, child);
              clas.childNodes.push(clasNodes);
              compiler(newNode, scope, slice(child.children), clasNodes, attributes);
              commom(newNode, scope, clasNodes, content, attributes);
            });
          } else {
            switch ((/(CODE|SCRIPT)/).test(child.clas.nodeName)) {
              case true:
                var newNode = child.clas.cloneNode(true);
                node.appendChild(newNode);
                var clasNodes = classNode(newNode, child);
                content.childNodes.push(clasNodes);
                break;
              default:
                var newNode = child.clas.cloneNode();
                node.appendChild(newNode);
                var clasNodes = classNode(newNode, child);
                content.childNodes.push(clasNodes);
                compiler(newNode, scopes, slice(child.children), clasNodes, attributes);
                commom(newNode, scopes, clasNodes, content, attributes);
                break;
            }
          }
          break;
        default:
          if ($each.test(child.clas.nodeValue)) {
            var expreses = child.clas.nodeValue.replace($each, "$2").split(":");
            var variable = expreses.shift().trim(), source = expreses.pop().trim(), id = expreses.shift();
            var dataSource = code(source, scopes);
            var clas = eachNode(null, node, child);
            content.childNodes.push(clas);
            binding(null, scopes, clas, content, attributes);
            each(dataSource, slice(child.children), function (item, index, children) {
              var scope = Object.create(scopes || {});
              setVariable(scope, variable, global.$path);
              if (id) scope[id.trim()] = index.toString();
              var clasNodes = classNode(null, child);
              clas.childNodes.push(clasNodes);
              compiler(node, scope, slice(children), clasNodes, attributes);
            });
          } else if ($when.test(child.clas.nodeValue)) {
            var when = code(child.clas.nodeValue.replace($when, "$2"), scopes);
            var clas = whenNode(null, node, child, content, scopes, attributes);
            clas.children.push(childNodes.shift());
            if (when) {
              binding(null, scopes, clas, content, attributes);
              each(childNodes, function (child, index, childNodes) {
                if (!whem(child)) return true;
                clas.children.push(childNodes.shift());
              });
              each(slice(child.children), function (child, index, childNodes) {
                switch (child.clas.nodeType == 1 || $chen.test(child.clas.nodeValue)) {
                  case true:
                    compiler(node, scopes, childNodes, clas, attributes);
                    break;
                  default:
                    var newNode = child.clas.cloneNode();
                    node.appendChild(newNode);
                    var clasNodes = classNode(newNode, child);
                    clas.childNodes.push(clasNodes);
                    commom(newNode, scopes, clasNodes, clas, attributes);
                    break;
                }
                childNodes.shift();
              });
            } else if (when == undefined) {
              binding(null, scopes, clas, content, attributes);
              each(slice(child.children), function (child, index, childNodes) {
                switch (child.clas.nodeType == 1 || $chen.test(child.clas.nodeValue)) {
                  case true:
                    compiler(node, scopes, childNodes, clas, attributes);
                    break;
                  default:
                    var newNode = child.clas.cloneNode();
                    node.appendChild(newNode);
                    var clasNodes = classNode(newNode, child);
                    clas.childNodes.push(clasNodes);
                    commom(newNode, scopes, clasNodes, clas, attributes);
                    break;
                }
                childNodes.shift();
              });
            } else if (whem(childNodes[0])) {
              compiler(node, scopes, childNodes, clas, attributes);
            }
            return whem(child);
          } else {
            var newNode = child.clas.cloneNode();
            node.appendChild(newNode);
            var clasNodes = classNode(newNode, child);
            content.childNodes.push(clasNodes);
            commom(newNode, scopes, clasNodes, content, attributes);
          }
          break;
      }
      childNodes.shift();
    });
  }

  function whem(child) {
    if (child) return new RegExp($whec).test(child.clas.nodeValue);
  }

  function binding(node, scope, clas, content, attributes) {
    try {
      var nodeValue = clas.clas.nodeValue;
      switch (clas.clas.nodeType) {
        case 1:
          var key = clas.clas.getAttribute("each").split(":").pop();
          if (code(key, scope) == undefined || global.$path == undefined) return;
          clas.resolver = "each";
          clas.content = content;
          clas.scope = scope;
          clas.path = [global.$path];
          clas.node = node;
          break;
        case 2:
          nodeValue.replace($expres, function (key) {
            clas.resolver = "express";
            clas.scope = scope;
            clas.path = [];
            clas.node = node;
            dep(key, scope, clas);
            if (clas.clas.name == "value") bind(node, scope);
            attributes.push(clas);
          });
          break;
        default:
          nodeValue.replace($each, function (key) {
            key = key.replace($each, "$2").split(":").pop();
            if (code(key, scope) == undefined || global.$path == undefined) return;
            clas.resolver = "each";
            clas.content = content;
            clas.scope = scope;
            clas.path = [global.$path];
            clas.node = node;
            throw null;
          });
          nodeValue.replace($when, function (key) {
            key = key.replace($when, "$2");
            clas.resolver = "when";
            clas.scope = scope;
            clas.path = [];
            clas.node = node;
            dep(key, scope, clas);
            throw null;
          });
          nodeValue.replace($express, function (key) {
            clas.resolver = "express";
            clas.scope = scope;
            clas.path = [];
            clas.node = node;
            dep(key, scope, clas);
          });
          break;
      }
    } catch (error) {
    }
  }

  function dep(key, scope, clas) {
    key.replace($word, function (key) {
      if (code(key, scope) == undefined || global.$path == undefined) return;
      clas.path.push(global.$path);
    });
  }

  function bind(node, scope) {
    var owner = node.ownerElement, handle;
    owner._express = node.nodeValue.replace($express, "$1");
    owner.on("change", handle = function () {
      new Function('scope',
        `
      scope`+ Path(owner._express) + `='` + owner.value.replace(/(\'|\")/g, "\\$1") + `';
      `
      )(scope);
    });
    if (owner.nodeName == "SELECT") {
      let value = code(owner._express, scope);
      blank(value) ? handle() : owner.value = value;
    }
  }

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
        children: [],
        scope: child.scope,
        childNodes: []
      }]
    };
  }

  function whenNode(newNode, node, child, content, scopes, attributes) {
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
          children: [],
          scope: child.scope,
          childNodes: []
        }]
      });
      binding(null, scopes, content, attributes);
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
      children: [],
      content: clas,
      childNodes: []
    });
  }

  function compoNode(node, child, component) {
    var comment = document.createComment("component:" + child.path);
    node.before(comment);
    component.content.node = component.view;
    return {
      node: child.node,
      clas: child.clas,
      children: [component.node],
      scope: child.scope,
      resolver: child.resolver,
      content: child.content,
      path: child.path,
      childNodes: [{
        node: comment,
        children: [],
        scope: child.scope,
        childNodes: []
      }, component.content]
    };
  }

  function attrNode(newNode, scope, clas) {
    return {
      node: newNode,
      clas: clas,
      children: [],
      scope: scope,
      childNodes: []
    };
  }

  function commom(node, scope, clas, content, attributes) {
    each(node.attributes, function (child) {
      let clasNodes = attrNode(child, scope, child.cloneNode());
      commom(child, scope, clasNodes, null, attributes);
    });
    if (new RegExp($component).test(node.nodeValue)) {
      comNode(node, scope, clas, content);
      resolver["component"](clas);
    } else if (new RegExp($express).test(node.nodeValue)) {
      binding(node, scope, clas, content, attributes);
      node.nodeValue = codex(node.nodeValue, scope);
    }
  }

  var resolver = {
    view: function (view, node, scope, content, attributes) {
      try {
        var doc = document.createDocumentFragment();
        compiler(doc, scope, slice(node.children), content, attributes);
        content.children = node.children;
        content.clas = node.clas;
        view.reappend(doc);
      } catch (e) {
        console.log(e);
      }
    },
    component: function (node) {
      try {
        let app = code(node.clas.nodeValue, node.scope);
        node.path = [global.$path];
        extention(app.model, node.scope);
        var insert = insertion(node.childNodes);
        var childNodes = node.content.childNodes;
        clearNodes(node.childNodes);
        let component = new View({ view: app.component, model: app.model });
        let clasNodes = compoNode(insert, node, component);
        childNodes.replace(node, clasNodes);
        if (insert.parentNode)
          insert.parentNode.replaceChild(component.view, insert);
      } catch (e) {
        console.log(e);
      }
    },
    when: function (node, attributes) {
      try {
        var insert = insertion(node.childNodes);
        var doc = document.createDocumentFragment();
        var childNodes = node.content.childNodes;
        clearNodes(node.childNodes);
        compiler(doc, node.scope, slice(node.children), node.content, attributes);
        childNodes.replace(node, childNodes.pop());
        if (insert.parentNode)
          insert.parentNode.replaceChild(doc, insert);
      } catch (e) {
        console.log(e);
      }
    },
    each: function (node, attributes) {
      try {
        var insert = insertion(node.childNodes);
        var doc = document.createDocumentFragment();
        var childNodes = node.content.childNodes;
        clearNodes(node.childNodes);
        compiler(doc, node.scope, [node], node.content, attributes);
        childNodes.replace(node, childNodes.pop());
        if (insert.parentNode)
          insert.parentNode.replaceChild(doc, insert);
      } catch (e) {
        console.log(e);
      }
    },
    express: function (node) {
      try {
        node.node.nodeValue = codex(node.clas.nodeValue, node.scope);
        if (node.node.name == "value")
          node.node.ownerElement.value = node.node.nodeValue;
      } catch (e) {
        console.log(e);
      }
    },
    attribute: function (node) {
      try {
        var newNode = document.createAttribute(codex(node.clas.name, scope));
        newNode.nodeValue = node.clas.nodeValue;
        node.node.ownerElement.setAttributeNode(newNode);
        node.node.ownerElement.removeAttributeNode(node.node);
      } catch (e) {
        console.log(e);
      }
    }
  };

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
    } catch (e) {
      console.log(e);
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

  function Router(app, params) {
    var $param = /^:/;
    let rout, para, router;
    this.redreact = redreact;

    function resolver(hash) {
      router = Object.keys(params);
      while (router.length) {
        rout = router.shift(), para = {};
        let path = rout.split("/");
        let hath = hash.split("/");

        if (match(path, hath)) return {
          component: params[rout].component,
          action: params[rout].action,
          params: para,
          router: rout
        }
      }
    }

    function match(path, hash) {
      while (hash.length) {
        let name = path.shift();
        let param = hash.shift();
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
      var hash = window.location.hash.replace("#", "");
      let router = resolver(hash);
      if (router) {
        router.action(router.params);
        app.model.router = router.component;
      }
    }

    window.addEventListener("load", action, false);
    window.addEventListener("onpopstate" in window ? "popstate" : "hashchange", action, false);

  }

  let global = { $path: undefined };

  function View(app) {
    var content = { childNodes: [], children: [] };
    var attributes = [];

    observe(app.model, function set(path) {
      deepen(content, path, attributes);
    }, function get(path) {
      global.$path = path;
    });

    switch (app.view ? "view" : "component") {
      case "view":
        var view = query(app.view);
        var node = initCompiler(init(slice(view)))[0];
        this.content = content;
        this.model = app.model;
        this.node = node;
        this.view = view[0];
        resolver["view"](this.view, node, app.model, content, attributes);
        break;
      case "component":
        var view = query(app.component);
        this.view = view[0];
        this.view.parentNode.removeChild(this.view);
        this.content = content;
        this.model = app.model;
        this.component = this.view.outerHTML;
        break;
    }
  }

  function deepen(content, path, attributes) {
    each(slice(content.childNodes), function (node) {
      if (node.path && node.path.has(path)) {
        resolver[node.resolver](node, attributes);
        return true;
      }
      if (node.childNodes[0])
        deepen(node, path, attributes);
    });
    each(attributes, function (node) {
      if (!node.node.ownerElement.parentNode) {
        attributes.remove(node);
        return;
      }
      if (node.path && node.path.has(path))
        resolver[node.resolver](node, attributes);
    });
  }

  window.View = View;
  window.Router = Router;
  window.clone = clone;

  exports.global = global;
  exports.View = View;

  return exports;

}({}));
