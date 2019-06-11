var view = (function (exports) {
  'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function whiles(obj, methd, me) {
    while (obj.length) {
      var data = obj[0];
      if (methd.call(me, data, obj)) break;
    }
  }
  function each(obj, methd, arg) {
    if (!obj) return;
    arg = arg || obj;
    Object.keys(obj).every(function (i) {
      var data = obj[i];
      return !methd.call(data, data, i, arg);
    });
    return arg;
  }
  function forEach(obj, methd, me) {
    if (!obj) return;

    if (obj.hasOwnProperty("$index")) {
      for (var i = obj.$index; i < obj.length; i++) {
        methd.call(me, obj[i], i);
      }
    } else {
      Object.keys(obj).forEach(function (i) {
        methd.call(me, obj[i], i);
      });
    }
  }
  function slice(obj) {
    return [].slice.call(obj);
  }
  function inject(methds, parent) {
    if (methds) Object.values(methds).forEach(function (methd) {
      var root = Object.assign({}, parent);
      root.__proto__ = Function.__proto__;
      methd.__proto__ = root;
    });
  }
  function extend(object, parent) {
    Reflect.setPrototypeOf(object, Object.prototype);
    object.__proto__ = parent;
    return object;
  }
  function blank(str) {
    return str == null || str == undefined || str == "";
  }

  if (!Object.values) {
    Object.assign(Object.prototype, {
      values: function values(object) {
        var values = [];
        Object.keys(object).forEach(function (key) {
          values.push(object[key]);
        });
        return values;
      }
    });
  }

  Object.assign(Array.prototype, {
    remove: function remove(n) {
      var index = this.indexOf(n);
      if (index > -1) this.splice(index, 1);
      return this;
    },
    replace: function replace(o, n) {
      var index = this.indexOf(o);
      if (index > -1) this.splice(index, 1, n);
    },
    splices: function splices(items) {
      this.splice.apply(this, items);
    },
    has: function has(o) {
      var index = this.indexOf(o);
      if (index > -1) return true;
      return false;
    },
    ones: function ones(o) {
      if (this.has(o)) return;
      this.push(o);
    }
  });

  var $lang = /((@each|@when|\.when)\s*\((.*)\)\s*\{|\{\s*([^\{\}]*)\s*\}|\s*\}\s*|\.when\s*\{)/g;
  var $chen = /(@each|@when|\.when)\s*\((.*)\)\s*\{|\.when\s*\{/;
  var $each = /(@each)\s*\((.*)\)\s*\{/g;
  var $when = /(@when|\.when)\s*\((.*)\)\s*\{|\.when\s*\{/g;
  var $whec = /\.when\s*\((.*)\)\s*\{|\.when\s*\{/g;
  var $whea = /@when/g;
  var $express = /\{\s*@?([^\{\}]*)\s*\}/;
  var $expres = /\{\s*([^\{\}]*)\s*\}/g;
  var $component = /\{\s*\s*@([^\{\}]*)\s*\}/;
  var $close = /(^\s*\}\s*$)/;
  var $event = /^@(.*)/;

  function init(dom) {
    each(dom, function (node) {
      if (node.childNodes[0] && !/(CODE|SCRIPT)/.test(node.nodeName)) init(slice(node.childNodes));
      if (node.nodeType == 3) node.nodeValue.replace($lang, function (tag) {
        var nodes = node.nodeValue.split(tag);
        node.parentNode.insertBefore(document.createTextNode(nodes[0]), node);
        node.parentNode.insertBefore(document.createTextNode(tag.trim()), node);
        node.nodeValue = node.nodeValue.replace(nodes[0], "").replace(tag, "");
      });
    });
    return dom;
  }
  function initCompiler(node, children) {
    var list = children || [];
    whiles(node, function (child) {
      node.shift();
      if (new RegExp($close).test(child.nodeValue)) return true;
      var item = {
        clas: child.cloneNode(true),
        children: []
      };
      if (!(child.nodeType == 3 && child.nodeValue.trim() == "")) list.push(item);

      if (child.nodeType == 1) {
        initCompiler(slice(child.childNodes), item.children);
      } else if (new RegExp($chen).test(child.nodeValue)) {
        initCompiler(node, item.children);
      }
    });
    return list;
  }

  function code(_express, _scope) {
    try {
      global.$path = undefined;
      global.$cache = new Map();
      _express = _express.replace($express, "$1");
      return Code(_express)(_scope);
    } catch (e) {
      return undefined;
    }
  }
  function codex(_express, _scope) {
    try {
      global.$path = undefined;
      global.$cache = new Map();
      _express = "'".concat(_express.replace($expres, "'+($1)+'"), "'");
      return Code(_express)(_scope);
    } catch (e) {
      return undefined;
    }
  }
  function Code(_express) {
    return new Function('_scope', "with (_scope) {\n       return ".concat(_express, ";\n    }"));
  }
  function Path(path) {
    try {
      return path.replace(/(\w+)\.?/g, "['$1']");
    } catch (e) {
      return undefined;
    }
  }
  function setVariable(scope, variable, path) {
    path = "".concat(Path(path));
    Object.defineProperty(scope, variable, {
      get: function get() {
        return new Function('scope', "\n        return scope".concat(path, ";\n        "))(scope);
      },
      set: function set(val) {
        new Function('scope', 'val', "\n        scope".concat(path, "=val;\n        "))(scope, val);
      }
    });
  }
  function handler(proto) {
    return {
      get: function get(parent, prop, proxy) {
        if (prop == "$target") return parent;
        if (parent.hasOwnProperty(prop)) return Reflect.get(parent, prop);
        return Reflect.get(proto, prop);
      },
      set: function set(parent, prop, val, proxy) {
        return Reflect.set(parent, prop, val);
      }
    };
  }

  function Compiler(node, scopes, childNodes, content, we) {
    function compiler(node, scopes, childNodes, content) {
      whiles(childNodes, function (child, childNodes) {
        if (child.clas.nodeType == 1) {
          if (child.clas.hasAttribute("each")) {
            var expreses = child.clas.getAttribute("each").split(":");
            var variable = expreses.shift().trim();
            var source = expreses.pop().trim();
            var id = expreses.shift();
            var dataSource = code(source, scopes);
            var clas = eachNode(null, node, child);
            content.childNodes.push(clas);
            binding.attrEach(null, scopes, clas, content, dataSource);
            forEach(dataSource, function (item, index) {
              var scope = Object.create(scopes.$target);
              scope = new Proxy(scope, handler(scopes));
              setVariable(scope, variable, global.$path);
              if (id) scope[id.trim()] = index;
              var newNode = child.clas.cloneNode();
              newNode.removeAttribute("each");
              node.appendChild(newNode);
              var clasNodes = classNode(newNode, child);
              clas.childNodes.push(clasNodes);
              compiler(newNode, scope, slice(child.children), clasNodes);
              commom(newNode, scope, clasNodes, content);
            });
          } else {
            if (/(CODE|SCRIPT)/.test(child.clas.nodeName)) {
              var newNode = child.clas.cloneNode(true);
              node.appendChild(newNode);
              var clasNodes = classNode(newNode, child);
              content.childNodes.push(clasNodes);
            } else {
              var newNode = child.clas.cloneNode();
              node.appendChild(newNode);
              var clasNodes = classNode(newNode, child);
              content.childNodes.push(clasNodes);
              compiler(newNode, scopes, slice(child.children), clasNodes);
              commom(newNode, scopes, clasNodes, content);
            }
          }
        } else {
          if ($each.test(child.clas.nodeValue)) {
            var expreses = child.clas.nodeValue.replace($each, "$2").split(":");
            var variable = expreses.shift().trim();
            var source = expreses.pop().trim();
            var id = expreses.shift();
            var dataSource = code(source, scopes);
            var clas = eachNode(null, node, child);
            content.childNodes.push(clas);
            binding.each(null, scopes, clas, content, dataSource);
            var children = slice(child.children);
            forEach(dataSource, function (item, index) {
              var scope = Object.create(scopes.$target);
              scope = new Proxy(scope, handler(scopes));
              setVariable(scope, variable, global.$path);
              if (id) scope[id.trim()] = index;
              var clasNodes = classNode(null, child);
              clas.childNodes.push(clasNodes);
              compiler(node, scope, slice(children), clasNodes);
            });
          } else if ($when.test(child.clas.nodeValue)) {
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
                } else {
                  var newNode = child.clas.cloneNode();
                  node.appendChild(newNode);
                  var clasNodes = classNode(newNode, child);
                  clas.childNodes.push(clasNodes);
                  commom(newNode, scopes, clasNodes, clas);
                }

                childNodes.shift();
              });
            } else if (when == undefined) {
              binding.when(null, scopes, clas, content);
              whiles(slice(child.children), function (child, childNodes) {
                if (child.clas.nodeType == 1 || $chen.test(child.clas.nodeValue)) {
                  compiler(node, scopes, childNodes, clas);
                } else {
                  var newNode = child.clas.cloneNode();
                  node.appendChild(newNode);
                  var clasNodes = classNode(newNode, child);
                  clas.childNodes.push(clasNodes);
                  commom(newNode, scopes, clasNodes, clas);
                }

                childNodes.shift();
              });
            } else if (whem(childNodes[0])) {
              compiler(node, scopes, childNodes, clas);
            }

            return whem(child);
          } else {
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
        var clas = attrNode(child, scope, child.cloneNode());

        if (new RegExp($expres).test(child.nodeValue)) {
          binding.attrExpress(child, scope, clas);
          child.nodeValue = codex(child.nodeValue, scope.$target);
        }

        bind(child, scope);
      });

      function bind(node, scope) {
        node.name.replace($event, function (key) {
          key = key.replace($event, "$1");
          var owner = node.ownerElement;
          var array = node.nodeValue.toString().match(/\(([^)]*)\)/);

          if (array) {
            var name = node.nodeValue.toString().replace(array[0], "");
            var methd = code(name, we.action);
            owner.on(key, methd, scope, array[1]);
          } else {
            var _methd = code(node.nodeValue, we.action);

            owner.on(key, _methd, scope);
          }
        });
      }
    }

    function commom(node, scope, clas, content) {
      var express;
      attrExpress(node, scope);

      if (new RegExp($component).test(node.nodeValue)) {
        comNode(node, scope, clas, content);
        resolver["component"](clas, we);
      } else if (express = new RegExp($express).exec(node.nodeValue)) {
        node.nodeValue = code(express[1], scope);
        binding.express(node, scope, clas);
      }
    }

    function whem(child) {
      if (child) return new RegExp($whec).test(child.clas.nodeValue);
    }

    var binding = {
      attrEach: function attrEach(node, scope, clas, content) {
        if (global.$cache == undefined) return;
        clas.resolver = "each";
        clas.content = content;
        clas.scope = scope;
        clas.node = node;
        setCache(clas, we, global.$cache);
      },
      each: function each(node, scope, clas, content) {
        if (global.$cache == undefined) return;
        clas.resolver = "each";
        clas.content = content;
        clas.scope = scope;
        clas.node = node;
        setCache(clas, we, global.$cache);
      },
      when: function when(node, scope, clas) {
        var nodeValue = clas.clas.nodeValue;
        var whens = new RegExp($when).exec(nodeValue);
        if (!whens) return;
        var key = whens.pop();
        clas.resolver = "when";
        clas.scope = scope;
        clas.node = node;
        dep(key, scope, clas);
      },
      express: function express(node, scope, clas) {
        if (global.$cache == undefined) return;
        clas.resolver = "express";
        clas.scope = scope;
        clas.node = node;
        setCache(clas, we, global.$cache);
      },
      attrExpress: function attrExpress(node, scope, clas) {
        var nodeValue = clas.clas.nodeValue;
        nodeValue.replace($expres, function (key) {
          clas.resolver = "express";
          clas.scope = scope;
          clas.node = node;
          if (clas.clas.name == ":model") return;
          dep(key, scope, clas);
        });
        if (clas.clas.name == "value" || clas.clas.name == ":model") model(node, scope);
      }
    };

    function dep(key, scope, clas) {
      var value = code(key, scope);
      if (global.$cache == undefined) return;
      setCache(clas, we, global.$cache);
      return value;
    }

    function model(node, scope) {
      var owner = node.ownerElement;
      owner._express = node.nodeValue.replace($express, "$1");

      var _express = "scope".concat(Path(owner._express));

      var methd = input[owner.type] || input[owner.localName] || input.other;
      methd(node, scope, _express);
    }

    var input = {
      checkbox: function checkbox(node, scope, _express) {
        try {
          var owner = node.ownerElement;
          owner.on("change", function () {
            var _value = owner.value.replace(/(\'|\")/g, "\\$1");

            var express = "".concat(_express, ".").concat(owner.checked ? "ones" : "remove", "('").concat(_value, "');");
            new Function('scope', express)(scope);
          });
          var value = code(owner._express, scope);
          if (Array.isArray(value) && value.has(owner.value)) owner.checked = true;
        } catch (error) {
          console.log(error);
        }
      },
      radio: function radio(node, scope, _express) {
        try {
          var owner = node.ownerElement;
          owner.on("change", function () {
            var _value = owner.value.replace(/(\'|\")/g, "\\$1");

            var express = "".concat(_express, "='").concat(_value, "';");
            new Function('scope', express)(scope);
          });
          var value = code(owner._express, scope);
          if (value == owner.value) owner.checked = true;
          owner.name = global.$path;
        } catch (error) {
          console.log(error);
        }
      },
      select: function select(node, scope, _express) {
        try {
          var owner = node.ownerElement,
              handle;
          owner.on("change", handle = function handle() {
            var _value = owner.value.replace(/(\'|\")/g, "\\$1");

            var express = "".concat(_express, "='").concat(_value, "';");
            new Function('scope', express)(scope);
          });
          var value = code(owner._express, scope);
          blank(value) ? handle() : owner.value = value;
        } catch (error) {
          console.log(error);
        }
      },
      other: function other(node, scope, _express) {
        try {
          var owner = node.ownerElement;
          owner.on("change", function () {
            var _value = owner.value.replace(/(\'|\")/g, "\\$1");

            var express = "".concat(_express, "='").concat(_value, "';");
            new Function('scope', express)(scope);
          });
        } catch (error) {
          console.log(error);
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
    view: function view(_view, node, scope, content, we) {
      try {
        var doc = document.createDocumentFragment();
        new Compiler(doc, scope, slice(node.children), content, we);
        content.children = node.children;
        content.clas = node.clas;

        _view.reappend(doc);
      } catch (e) {
        console.log(e);
      }
    },
    component: function component(node, we) {
      try {
        global.$cache = new Map();
        var app = code(node.clas.nodeValue, node.scope);
        var $cache = global.$cache;
        node.path = global.$path;
        if (blank(app)) return;
        extend(app.model, node.scope);
        var insert = insertion(node.childNodes);
        var childNodes = node.content.childNodes;
        clearNodes(node.childNodes);
        var component = new View$1({
          view: app.component,
          model: app.model,
          action: app.action
        });
        var clasNodes = compoNode(insert, node, component);
        setCache(clasNodes, we, $cache);
        childNodes.replace(node, clasNodes);
        if (insert.parentNode) insert.parentNode.replaceChild(component.view, insert);
      } catch (e) {
        console.log(e);
      }
    },
    when: function when(node, we) {
      try {
        var insert = insertion(node.childNodes);
        var doc = document.createDocumentFragment();
        var childNodes = node.content.childNodes;
        clearNodes(node.childNodes);
        new Compiler(doc, node.scope, slice(node.children), node.content, we);
        childNodes.replace(node, childNodes.pop());
        if (insert.parentNode) insert.parentNode.replaceChild(doc, insert);
      } catch (e) {
        console.log(e);
      }
    },
    each: function each(node, we) {
      try {
        var insert = insertion(node.childNodes);
        var doc = document.createDocumentFragment();
        var childNodes = node.content.childNodes;
        clearNodes(node.childNodes);
        new Compiler(doc, node.scope, [node], node.content, we);
        childNodes.replace(node, childNodes.pop());
        if (insert.parentNode) insert.parentNode.replaceChild(doc, insert);
      } catch (e) {
        console.log(e);
      }
    },
    arrayEach: function arrayEach(node, we, index, nodes) {
      try {
        var insert = insertNode([node.childNodes[index]]);
        var doc = document.createDocumentFragment();
        var child = {
          clas: node.clas,
          children: node.children,
          scope: node.scope
        };
        var content = {
          childNodes: [],
          children: []
        };
        new Compiler(doc, node.scope, [child], content, we);
        doc.removeChild(doc.childNodes[0]);
        var childNodes = slice(content.childNodes[0].childNodes);
        childNodes.splice(0, 1, index + 1, 0);
        node.childNodes.splices(childNodes);
        nodes.remove(content.childNodes[0]);
        if (insert.parentNode) insert.after(doc);
      } catch (e) {
        console.log(e);
      }
    },
    express: function express(node, we, cache) {
      try {
        node.node.nodeValue = codex(node.clas.nodeValue, node.scope);
        setCache(node, we, cache);
        if (node.node.name == "value") node.node.ownerElement.value = node.node.nodeValue;
      } catch (e) {
        console.log(e);
      }
    },
    attribute: function attribute(node, we, cache) {
      try {
        var newNode = document.createAttribute(codex(node.clas.name, scope));
        setCache(node, we, cache);
        newNode.nodeValue = node.clas.nodeValue;
        node.node.ownerElement.setAttributeNode(newNode);
        node.node.ownerElement.removeAttributeNode(node.node);
      } catch (e) {
        console.log(e);
      }
    }
  };
  var cacher = function cacher(cache, index, add) {
    cache.forEach(function (nodes, we) {
      nodes.forEach(function (node) {
        try {
          if (arrayEach[node.resolver]) arrayEach[node.resolver](node, we, nodes, index, add);else resolver[node.resolver](node, we, cache);
        } catch (e) {
          console.error(e);
        }
      });
    });
  };
  var arrayEach = {
    each: function each(node, we, children, index, add) {
      try {
        if (add > 0) {
          resolver.arrayEach(node, we, index, children);
        } else {
          var nodes = node.childNodes.splice(index + 1);
          clearNodes(nodes);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };
  function setCache(clas, we, $cache) {
    $cache.forEach(function (value) {
      var cache = value.get(we);

      if (cache) {
        cache.ones(clas);
      } else {
        value.set(we, [clas]);
      }
    });
  }

  function insertion(nodes, node) {
    try {
      each(nodes, function (child) {
        if (child.node && child.node.parentNode) {
          node = child.node;
          child.node = null;
          return node;
        }
        node = insertion(child.childNodes);
      });
      return node;
    } catch (e) {
      console.log(e);
    }
  }

  function insertNode(nodes, node) {
    try {
      each(nodes, function (child) {
        if (child.node && child.node.parentNode) {
          node = child.node;
          return node;
        }

        if (child.childNodes.length) {
          var children = child.childNodes[child.childNodes.length - 1];

          if (children.node && children.node.parentNode) {
            node = children.node;
            return node;
          }

          node = insertNode([children]);
        }
      });
      return node;
    } catch (e) {
      console.log(e);
    }
  }

  function clearNodes(nodes) {
    nodes.forEach(function (child) {
      if (child.node && child.node.parentNode) return child.node.parentNode.removeChild(child.node);
      if (child.childNodes) clearNodes(child.childNodes);
    });
  }

  function observer(target, call) {
    if (_typeof(target) != 'object') return target;
    target = new Proxy(target, handler());

    function handler(root) {
      var values = new Map(),
          cache = new Map();
      return {
        get: function get(parent, prop, proxy) {
          if (prop == "$target") return parent;
          var method = array(proxy, prop, root);
          if (method) return method;
          if (!parent.hasOwnProperty(prop)) return parent[prop];
          var path = root ? "".concat(root, ".").concat(prop) : prop;
          var value = getValue(values, cache, parent, prop, path);
          global.$cache["delete"](root);
          global.$cache.set(path, cache.get(prop));
          mq.publish(target, "get", [path]);
          return value;
        },
        set: function set(parent, prop, val, proxy) {
          var oldValue = values.get(prop);
          var oldCache = cache.get(prop);
          values.set(prop, undefined);
          cache.set(prop, new Map());
          Reflect.set(parent, prop, val.$target || val);
          setValue(proxy[prop], oldValue);
          var path = root ? "".concat(root, ".").concat(prop) : prop;
          mq.publish(target, "set", [new Map([[path, oldCache]]), new Map([[path, cache.get(prop)]])]);
          return true;
        }
      };
    }

    function getValue(values, cache, parent, prop, path) {
      var value = values.get(prop);
      if (value != undefined) return value;
      cache.set(prop, new Map());
      value = Reflect.get(parent, prop);

      if (!(value instanceof View) && _typeof(value) == "object") {
        value = new Proxy(value, handler(path));
      }

      values.set(prop, value);
      return value;
    }

    function setValue(object, oldObject) {
      if (_typeof(object) == "object" && _typeof(oldObject) == "object") {
        Object.keys(oldObject).forEach(function (prop) {
          global.$cache = new Map();
          var value = object[prop],
              cache = global.$cache;
          global.$cache = new Map();
          var oldValue = oldObject[prop],
              oldCache = global.$cache;
          if (_typeof(value) != "object" && _typeof(oldValue) != "object") mq.publish(target, "set", [oldCache, cache]);
          setValue(value, oldValue);
        });
      }
    }

    function array(object, name, root) {
      if (!Array.isArray(object)) return;
      var meths = {
        shift: function shift() {
          var method = Array.prototype.shift;
          var data = method.apply(this, arguments);
          var index = this.length;
          cacher(getCache(), index);
          return data;
        },
        pop: function pop() {
          var method = Array.prototype.pop;
          var data = method.apply(this, arguments);
          var index = this.length;
          cacher(getCache(), index);
          return data;
        },
        splice: function splice() {
          var method = Array.prototype.splice;

          if (this.length) {
            var index = this.length;
            var data = method.apply(this, arguments);
            arguments.length > 2 ? this.$index = index : index = this.length;
            cacher(getCache(), index, arguments.length - 2);
            Reflect.deleteProperty(this, "$index");
            return data;
          }
        },
        unshift: function unshift() {
          var method = Array.prototype.unshift;

          if (arguments.length) {
            var index = this.$index = this.length;
            var data = method.apply(this, arguments);
            cacher(getCache(), index, arguments.length);
            Reflect.deleteProperty(this, "$index");
            return data;
          }
        },
        push: function push() {
          var method = Array.prototype.push;

          if (arguments.length) {
            var index = this.$index = this.length;
            var data = method.apply(this, arguments);
            cacher(getCache(), index, arguments.length);
            Reflect.deleteProperty(this, "$index");
            return data;
          }
        },
        reverse: function reverse() {
          var method = Array.prototype.reverse;
          var data = method.apply(this, arguments);
          return data;
        },
        sort: function sort() {
          var method = Array.prototype.sort;
          var data = method.apply(this, arguments);
          return data;
        }
      };
      Reflect.setPrototypeOf(meths, object);

      function getCache() {
        global.$cache = new Map();
        new Function('scope', "\n        return scope".concat(Path(root), ";\n        "))(target);
        return global.$cache.get(root);
      }

      return meths[name];
    }

    Object.keys(call).forEach(function (key) {
      mq.subscribe(target, key, call[key]);
    });
    return target;
  }

  var Mess =
  /*#__PURE__*/
  function () {
    function Mess() {
      _classCallCheck(this, Mess);

      this.map = new Map();
    }

    _createClass(Mess, [{
      key: "publish",
      value: function publish(scope, event, data) {
        var cache = this.map.get(scope);

        if (cache) {
          var action = cache.get(event);

          if (action) {
            action.data.push(data);
          } else {
            cache.set(event, {
              data: [data],
              queue: []
            });
          }
        } else {
          var _data = new Map();

          _data.set(event, {
            data: [_data],
            queue: []
          });

          this.map.set(scope, _data);
        }

        this.notify(cache.get(event));
      }
    }, {
      key: "notify",
      value: function notify(action) {
        if (action) {
          var _loop = function _loop() {
            var data = action.data.shift();
            action.queue.forEach(function (call) {
              call(data[0], data[1], data[2]);
            });
          };

          while (action.data.length) {
            _loop();
          }
        } else {
          this.map.forEach(function (cache) {
            cache.forEach(function (action) {
              var _loop2 = function _loop2() {
                var data = action.data.shift();
                action.queue.forEach(function (call) {
                  call(data[0], data[1], data[2]);
                });
              };

              while (action.data.length) {
                _loop2();
              }
            });
          });
        }
      }
    }, {
      key: "subscribe",
      value: function subscribe(scope, event, call) {
        var cache = this.map.get(scope);

        if (cache) {
          var action = cache.get(event);

          if (action) {
            action.queue.push(call);
          } else {
            cache.set(event, {
              data: [],
              queue: [call]
            });
          }
        } else {
          var data = new Map();
          data.set(event, {
            data: [],
            queue: [call]
          });
          this.map.set(scope, data);
        }
      }
    }]);

    return Mess;
  }();

  var mq = new Mess();

  function Router(app, params) {
    var $param = /^:/,
        $root = /^\/(.+)/;
    var router, para, routes;
    this.redreact = redreact;

    var supportsPushState = function () {
      var userAgent = window.navigator.userAgent;

      if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1 || userAgent.indexOf("Edge") > -1) {
        return false;
      }

      return window.history && 'pushState' in window.history;
    }();

    function resolver(hash) {
      routes = Object.keys(params);

      while (routes.length) {
        router = routes.shift(), para = {};
        var routs = router.replace($root, "$1");
        routs = routs.split("/");
        var haths = hash.split("/");
        if (match(routs, haths)) return {
          component: params[router].component,
          router: params[router].router,
          action: params[router].action,
          after: params[router].after,
          params: para,
          path: hash
        };
      }
    }

    function match(routs, hashs) {
      while (hashs.length) {
        var name = routs.shift();
        var param = hashs.shift();

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
      var url = window.location.pathname;
      window.location.href = url + "#" + path;
    }

    function action(event) {
      var hash = window.location.hash.replace(/^#\/?/, "");
      var router = resolver(hash);

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
    } catch (e) {
      var newNode = document.createElement("div");
      newNode.innerHTML = express.trim();
      return newNode.childNodes;
    }
  }

  function addListener(type, methods, scope) {
    if (this.addEventListener) {
      this.addEventListener(type, function (event) {
        methods.forEach(function (params, method) {
          params.forEach(function (param) {
            var args = param ? code("[".concat(param, "]"), scope) : [];
            args.push(event);
            method.apply(extend({
              $view: method.$view,
              $action: method.$action
            }, method.$model), args);
          });
        });
      }, false);
    } else if (this.attachEvent) {
      this.attachEvent('on' + type, function (event) {
        methods.forEach(function (params, method) {
          params.forEach(function (param) {
            var args = param ? code("[".concat(param, "]"), scope) : [];
            args.push(event);
            method.apply(extend({
              $view: method.$view,
              $action: method.$action
            }, method.$model), args);
          });
        });
      });
    } else {
      element['on' + type] = function (event) {
        methods.forEach(function (params, method) {
          params.forEach(function (param) {
            var args = param ? code("[".concat(param, "]"), scope) : [];
            args.push(event);
            method.apply(extend({
              $view: method.$view,
              $action: method.$action
            }, method.$model), args);
          });
        });
      };
    }
  }

  function removeListener(type, handler) {
    if (this.addEventListener) {
      this.removeEventListener(type, handler, false);
    } else if (this.detachEvent) {
      this.detachEvent('on' + type, handler);
    } else {
      element['on' + type] = null;
    }
  }

  Object.assign(Node.prototype, {
    on: function on(type, handler, scope, params) {
      if (this._manager) {
        if (this._manager.get(type)) {
          var methods = this._manager.get(type);

          if (methods.get(handler)) {
            methods.get(handler).ones(params);
          } else {
            methods.set(handler, [params]);
          }
        } else {
          var _methods = new Map();

          _methods.set(handler, [params]);

          this._manager.set(type, _methods);

          addListener.call(this, type, _methods, scope);
        }
      } else {
        var _methods2 = new Map();

        _methods2.set(handler, [params]);

        this._manager = new Map();

        this._manager.set(type, _methods2);

        addListener.call(this, type, _methods2, scope);
      }

      return this;
    },
    off: function off(type, handler) {
      if (this._manager) {
        var methods = this._manager.get(type);

        if (methods == undefined) return;
        methods["delete"](handler);
        if (methods.size) return;

        this._manager["delete"](type);

        removeListener.call(this, type, handler);
      }

      return this;
    },
    reappend: function reappend(node) {
      each(slice(this.childNodes), function (child) {
        child.parentNode.removeChild(child);
      });
      this.appendChild(node);
      return this;
    },
    before: function before(node) {
      this.parentNode.insertBefore(node, this);
    },
    after: function after(node) {
      if (this.nextSibling) this.parentNode.insertBefore(node, this.nextSibling);else this.parentNode.appendChild(node);
    }
  });
  Object.assign(NodeList.prototype, {
    on: function on(type, call) {
      each(this, function (node) {
        node.on(type, call);
      });
      return this;
    },
    off: function off(type, call) {
      each(this, function (node) {
        node.off(type, call);
      });
      return this;
    }
  });

  var global = {
    $path: undefined
  };
  var View$1 =
  /*#__PURE__*/
  function () {
    function View(app) {
      _classCallCheck(this, View);

      this.content = {
        childNodes: [],
        children: []
      };
      this.model = app.model;
      this.action = app.action;
      app.view ? this.view(app) : this.component(app);
    }

    _createClass(View, [{
      key: "view",
      value: function view(app) {
        app.model = observer(app.model, {
          set: function set(cache, newCache) {
            deepen(cache, newCache);
          },
          get: function get(path) {
            global.$path = path;
          }
        });
        this.model = app.model;
        var view = query(app.view);
        var node = initCompiler(init(slice(view)))[0];
        this.node = node;
        this.view = view[0];
        inject(app.action, {
          $view: this.view,
          $model: app.model,
          $action: app.action
        });
        resolver.view(this.view, node, app.model, this.content, this);
      }
    }, {
      key: "component",
      value: function component(app) {
        var view = query(app.component);
        this.view = view[0];
        this.view.parentNode.removeChild(this.view);
        this.component = this.view.outerHTML;
      }
    }]);

    return View;
  }();

  function clearNode(nodes, status) {
    try {
      nodes.every(function (child) {
        if (child.node) {
          var node = child.node.ownerElement || child.node;
          status = document.body.contains(node);
          return false;
        }
        status = clearNode(child.childNodes);
      });
      return status;
    } catch (e) {
      console.log(e);
    }
  }

  function deepen(cache, newCache) {
    if (cache && newCache) {
      cache.forEach(function (caches) {
        if (!caches) return;
        caches.forEach(function (nodes, we) {
          slice(nodes).forEach(function (node) {
            if (clearNode([node])) resolver[node.resolver](node, we, newCache);else nodes.remove(node);
          });
        });
      });
    } else if (cache && !newCache) {
      cache.forEach(function (caches) {
        if (!caches) return;
        caches.forEach(function (nodes) {
          clearNodes(nodes);
        });
      });
    }
  }

  window.View = View$1;
  window.Router = Router;
  window.query = query;

  exports.View = View$1;
  exports.global = global;

  return exports;

}({}));
