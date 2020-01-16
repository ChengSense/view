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

  function whiles(obj, method, me) {
    while (obj.length) {
      var data = obj[0];
      if (method.call(me, data, obj)) break;
    }
  }
  function each(obj, method, arg) {
    if (!obj) return;
    arg = arg || obj;
    Object.keys(obj).every(function (i) {
      var data = obj[i];
      return !method.call(data, data, i, arg);
    });
    return arg;
  }
  function forEach(obj, method, me) {
    if (!obj) return;

    if (obj.hasOwnProperty("$index")) {
      for (var i = obj.$index; i < obj.length; i++) {
        method.call(me, obj[i], i);
      }
    } else {
      Object.keys(obj).forEach(function (i) {
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
  var $word = /(["'][^"']*["'])|(([_\$a-zA-Z]+\w?)((\.\w+)|(\[(.+)\]))*)/g;
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
      _express = "'".concat(_express.replace($expres, "'+($1)+'"), "'");
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
      var filter = Reflect.getPrototypeOf(we.filter);
      Reflect.setPrototypeOf(filter, _scope);
      return Code(_express, we.filter);
    } catch (error) {
      console.warn(error);
      return undefined;
    }
  }

  var codeCacher = new Map();

  function Code(_express, scope) {
    var express = codeCacher.get(_express);
    if (express == undefined) codeCacher.set(_express, express = _express.replace($word, function (word) {
      return word.match(/["']/) ? word : "scope.".concat(word);
    }));
    return new Function('scope', "return ".concat(express, ";"))(scope);
  }
  function handler(proto, field, scope, key) {
    return {
      get: function get(parent, prop) {
        if (field == prop) return Reflect.get(scope, key);
        if (prop == "$target") return parent;
        if (parent.hasOwnProperty(prop)) return Reflect.get(parent, prop);
        return Reflect.get(proto, prop);
      },
      set: function set(parent, prop, val) {
        if (field == prop) return Reflect.set(scope, key, val);
        if (parent.hasOwnProperty(prop)) return Reflect.set(parent, prop, val);
        return Reflect.set(proto, prop, val);
      }
    };
  }
  function setScopes(we) {
    var action = {
      $view: we.view,
      $model: we.model,
      $action: we.action,
      $watch: we.watch
    };
    we.action = we.action || {};
    Reflect.setPrototypeOf(action, Function.prototype);
    Object.values(we.action).forEach(function (method) {
      return Reflect.setPrototypeOf(method, action);
    });
    var filter = Object.assign({}, action);
    we.filter = we.filter || {};
    Reflect.setPrototypeOf(we.filter, filter);
  }

  function Compiler(node, scopes, childNodes, content, we) {
    function compiler(node, scopes, childNodes, content) {
      whiles(childNodes, function (child, childNodes) {
        if (child.clas.nodeType == 1) {
          if (child.clas.hasAttribute("@each")) {
            var expreses = child.clas.getAttribute("@each").split(":");
            var field = expreses.shift().trim();
            var source = expreses.pop().trim();
            var id = expreses.shift();
            var sources = code(source, scopes);
            var clas = eachNode(null, node, child);
            content.childNodes.push(clas);
            binding.attrEach(null, scopes, clas, content);
            forEach(sources, function (item, index) {
              var scope = Object.create(scopes.$target);
              if (id) scope[id.trim()] = index;
              scope = new Proxy(scope, handler(scopes, field, sources, index));
              var newNode = child.clas.cloneNode();
              newNode.removeAttribute("@each");
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
              component(newNode, scopes, clasNodes, content);
              compiler(newNode, scopes, slice(child.children), clasNodes);
              commom(newNode, scopes, clasNodes, content);
            }
          }
        } else {
          if ($each.test(child.clas.nodeValue)) {
            var expreses = child.clas.nodeValue.replace($each, "$2").split(":");
            var field = expreses.shift().trim();
            var source = expreses.pop().trim();
            var id = expreses.shift();
            var sources = code(source, scopes);
            var clas = eachNode(null, node, child);
            content.childNodes.push(clas);
            binding.each(null, scopes, clas, content);
            var children = slice(child.children);
            forEach(sources, function (item, index) {
              var scope = Object.create(scopes.$target);
              if (id) scope[id.trim()] = index;
              scope = new Proxy(scope, handler(scopes, field, sources, index));
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

        if (clas.clas.name == ":model") {
          model(child, scope);
        } else if (new RegExp($expres).test(child.nodeValue)) {
          if (clas.clas.name == "value") model(child, scope);
          child.nodeValue = codex(child.nodeValue, scope, we);
          binding.attrExpress(child, scope, clas);
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
            var method = code(name, we.action);
            owner.on(key, method, scope, array[1]);
          } else {
            var _method = code(node.nodeValue, we.action);

            owner.on(key, _method, scope);
          }
        });
      }
    }

    function component(node, scope, clas, content) {
      if (Reflect.has(we.component, node.localName)) {
        comNode(node, scope, clas, content);
        resolver["component"](clas, we);
      }
    }

    function commom(node, scope, clas, content) {
      var express;
      attrExpress(node, scope);

      if (new RegExp($component).test(node.nodeValue)) {
        comNode(node, scope, clas, content);
        resolver["component"](clas, we);
      } else if (express = new RegExp($expres).exec(node.nodeValue)) {
        node.nodeValue = codeo(express[1], scope, we);
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
        if (global.$cache == undefined) return;
        var nodeValue = clas.clas.nodeValue;
        var whens = new RegExp($when).exec(nodeValue);
        if (!whens) return;
        clas.resolver = "when";
        clas.scope = scope;
        clas.node = node;
        setCache(clas, we, global.$cache);
      },
      express: function express(node, scope, clas) {
        if (global.$cache == undefined) return;
        clas.resolver = "express";
        clas.scope = scope;
        clas.node = node;
        setCache(clas, we, global.$cache);
      },
      attrExpress: function attrExpress(node, scope, clas) {
        if (global.$cache == undefined) return;
        clas.resolver = "express";
        clas.scope = scope;
        clas.node = node;
        setCache(clas, we, global.$cache);
      }
    };

    function model(node, scope) {
      var owner = node.ownerElement;
      owner._express = node.nodeValue.replace($express, "$1");

      var _express = "scope.".concat(owner._express);

      var method = input[owner.type] || input[owner.localName] || input.other;
      method(node, scope, _express);
    }

    var input = {
      checkbox: function checkbox(node, scope, _express) {
        try {
          var owner = node.ownerElement;
          owner.on("change", function () {
            var _value = owner.value.replace(/(\'|\")/g, "\\$1");

            var value = code(owner._express, scope);
            owner.checked ? value.ones(_value) : value.remove(_value);
          }, scope);
          var value = code(owner._express, scope);
          if (Array.isArray(value) && value.has(owner.value)) owner.checked = true;
        } catch (error) {
          console.error(error);
        }
      },
      radio: function radio(node, scope, _express) {
        try {
          var owner = node.ownerElement;
          owner.on("change", function () {
            var _value = owner.value.replace(/(\'|\")/g, "\\$1");

            var express = "".concat(_express, "='").concat(_value, "';");
            new Function('scope', express)(scope);
          }, scope);
          var value = code(owner._express, scope);
          if (value == owner.value) owner.checked = true;
          owner.name = global.$path;
        } catch (error) {
          console.error(error);
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
          }, scope);
          var value = code(owner._express, scope);
          blank(value) ? handle() : owner.value = value;
        } catch (error) {
          console.error(error);
        }
      },
      other: function other(node, scope, _express) {
        try {
          var owner = node.ownerElement;
          owner.on("change", function () {
            var _value = owner.value.replace(/(\'|\")/g, "\\$1");

            var express = "".concat(_express, "='").concat(_value, "';");
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
      } catch (error) {
        console.error(error);
      }
    },
    component: function component(node, we) {
      try {
        var app = new we.component[node.clas.localName]();
        if (blank(app)) return;
        Reflect.setPrototypeOf(app.model, node.scope);
        var insert = insertion(node.childNodes);
        var childNodes = node.content.childNodes;
        clearNodes(node.childNodes);
        var component = new View({
          view: app.view,
          model: app.model,
          action: app.action
        });
        var clasNodes = compoNode(insert, node, component);
        childNodes.replace(node, clasNodes);
        if (insert.parentNode) insert.parentNode.replaceChild(component.view, insert);
        if (!node.clas.hasAttribute("@id")) return;
        var id = codex(node.clas.getAttribute("@id"), node.scope, we);
        var idNode = node.clas.getAttributeNode("@id").cloneNode();
        idNode.nodeValue = id;
        component.view.setAttributeNode(idNode);
        Reflect.set(component.view, "@".concat(id), component);
      } catch (error) {
        console.error(error);
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
      } catch (error) {
        console.error(error);
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
      } catch (error) {
        console.error(error);
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
      } catch (error) {
        console.error(error);
      }
    },
    express: function express(node, we, cache) {
      try {
        node.node.nodeValue = codex(node.clas.nodeValue, node.scope, we);
        setCache(node, we, cache);
        if (node.node.name == "value") node.node.ownerElement.value = node.node.nodeValue;
      } catch (error) {
        console.error(error);
      }
    },
    attribute: function attribute(node, we, cache) {
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
  var cacher = function cacher(cache, index, add) {
    cache.forEach(function (nodes, we) {
      nodes.forEach(function (node) {
        try {
          if (arrayEach[node.resolver]) arrayEach[node.resolver](node, we, nodes, index, add);else resolver[node.resolver](node, we, cache);
        } catch (error) {
          console.error(error);
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
      } catch (error) {
        console.error(error);
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

        ;
        node = insertion(child.childNodes);
      });
      return node;
    } catch (error) {
      console.error(error);
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
    } catch (error) {
      console.error(error);
    }
  }

  function clearNodes(nodes) {
    nodes.forEach(function (child) {
      if (child.node && child.node.parentNode) return child.node.parentNode.removeChild(child.node);
      if (child.childNodes) clearNodes(child.childNodes);
    });
  }

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

  function observer(target, call, watch) {
    if (_typeof(target) != 'object') return target;
    target = new Proxy(target, handler());

    function handler(root) {
      var values = new Map(),
          caches = new Map();
      return {
        get: function get(parent, prop, proxy) {
          if (prop == "$target") return parent;
          if (!parent.hasOwnProperty(prop) && Reflect.has(parent, prop)) return Reflect.get(parent, prop);
          var path = root ? "".concat(root, ".").concat(prop) : prop;
          global.$cache["delete"](root);
          global.$cache.set(path, caches.get(prop));
          mq.publish(target, "get", [path]);
          var value = values.get(prop);
          if (value != undefined) return value;
          value = Reflect.get(parent, prop);
          if (check(value)) value = new Proxy(value, handler(path));
          values.set(prop, value);
          caches.set(prop, new Map());
          global.$cache["delete"](root);
          global.$cache.set(path, caches.get(prop));
          array(value, caches.get(prop));
          return value;
        },
        set: function set(parent, prop, val, proxy) {
          if (!parent.hasOwnProperty(prop) && Reflect.has(parent, prop)) return Reflect.set(parent, prop, val);
          var oldValue = values.get(prop);
          var oldCache = caches.get(prop);
          values["delete"](prop);
          caches["delete"](prop);
          Reflect.set(parent, prop, val.$target || val);
          var value = proxy[prop];
          setValue(value, oldValue);
          var path = root ? "".concat(root, ".").concat(prop) : prop;
          mq.publish(target, "set", [new Map([[path, oldCache]]), new Map([[path, caches.get(prop)]])]);
          mq.publish(target, path, [value, oldValue]);
          return true;
        }
      };
    }

    function setValue(object, oldObject) {
      if (object instanceof Component) return;

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

    function check(value) {
      if (value instanceof Component) return;
      if (value instanceof Date) return;
      if (_typeof(value) == "object") return value;
    }

    Object.keys(call).forEach(function (key) {
      return mq.subscribe(target, key, call[key]);
    });
    Object.keys(watch || {}).forEach(function (key) {
      return mq.subscribe(target, key, watch[key]);
    });
    return target;
  }

  function array(object, cache) {
    if (!Array.isArray(object)) return;
    var methods = {
      shift: function shift() {
        var method = Array.prototype.shift;
        var data = method.apply(this, arguments);
        var index = this.length;
        cacher(cache, index);
        return data;
      },
      pop: function pop() {
        var method = Array.prototype.pop;
        var data = method.apply(this, arguments);
        var index = this.length;
        cacher(cache, index);
        return data;
      },
      splice: function splice() {
        var method = Array.prototype.splice;

        if (this.length) {
          var index = this.length;
          var data = method.apply(this, arguments);
          arguments.length > 2 ? this.$index = index : index = this.length;
          cacher(cache, index, arguments.length - 2);
          Reflect.deleteProperty(this, "$index");
          return data;
        }
      },
      unshift: function unshift() {
        var method = Array.prototype.unshift;

        if (arguments.length) {
          var index = this.$index = this.length;
          var data = method.apply(this, arguments);
          cacher(cache, index, arguments.length);
          Reflect.deleteProperty(this, "$index");
          return data;
        }
      },
      push: function push() {
        var method = Array.prototype.push;

        if (arguments.length) {
          var index = this.$index = this.length;
          var data = method.apply(this, arguments);
          cacher(cache, index, arguments.length);
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
    Reflect.setPrototypeOf(methods, Array.prototype);
    Reflect.setPrototypeOf(object, methods);
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

        this.notify(cache.get(event), scope);
      }
    }, {
      key: "notify",
      value: function notify(action, scope) {
        if (action) {
          var _loop = function _loop() {
            var data = action.data.shift();
            action.queue.forEach(function (call) {
              call.apply(scope, data);
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
                  call.apply(scope, data);
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
    } catch (error) {
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
            var proto = Reflect.getPrototypeOf(method);
            var action = Object.assign({}, proto);
            Reflect.setPrototypeOf(action, scope || method.$model);
            method.apply(action, args);
          });
        });
      }, false);
    } else if (this.attachEvent) {
      this.attachEvent('on' + type, function (event) {
        methods.forEach(function (params, method) {
          params.forEach(function (param) {
            var args = param ? code("[".concat(param, "]"), scope) : [];
            args.push(event);
            var proto = Reflect.getPrototypeOf(method);
            var action = Object.assign({}, proto);
            Reflect.setPrototypeOf(action, scope || method.$model);
            method.apply(action, args);
          });
        });
      });
    } else {
      element['on' + type] = function (event) {
        methods.forEach(function (params, method) {
          params.forEach(function (param) {
            var args = param ? code("[".concat(param, "]"), scope) : [];
            args.push(event);
            var proto = Reflect.getPrototypeOf(method);
            var action = Object.assign({}, proto);
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
  var View =
  /*#__PURE__*/
  function () {
    function View(app) {
      _classCallCheck(this, View);

      this.model = observer(app.model, watcher);
      this.action = app.action;
      this.watch = app.watch;
      this.filter = app.filter;
      this.component = {};
      this.componenter(app.component);
      this.creater(app);
    }

    _createClass(View, [{
      key: "creater",
      value: function creater(app) {
        this.content = {
          childNodes: [],
          children: []
        };
        this.view = query(app.view)[0];
        var node = initCompiler(init([this.view]))[0];
        setScopes(this);
        resolver.view(this.view, node, this.model, this.content, this);
      }
    }, {
      key: "componenter",
      value: function componenter(a) {
        var _this = this;

        var list = Object.values(a || {});
        list.forEach(function (o) {
          var name = o.name.toLowerCase();
          Reflect.set(_this.component, name, o);
        });
      }
    }]);

    return View;
  }();
  var watcher = {
    set: function set(cache, newCache) {
      deepen(cache, newCache);
    },
    get: function get(path) {
      global.$path = path;
    }
  };
  var Component$1 =
  /*#__PURE__*/
  function () {
    function Component(app) {
      _classCallCheck(this, Component);

      this.model = app.model;
      this.action = app.action;
      this.watch = app.watch;
      this.filter = app.filter;
      this.creater(app);
    }

    _createClass(Component, [{
      key: "creater",
      value: function creater(app) {
        this.content = {
          childNodes: [],
          children: []
        };
        var view = query(app.view)[0];
        view.parentNode.removeChild(view);
        this.view = view.outerHTML;
      }
    }]);

    return Component;
  }();

  function clearNode(nodes, status) {
    try {
      nodes.every(function (child) {
        if (child.node) {
          var node = child.node.ownerElement || child.node;
          status = document.body.contains(node);
          return false;
        }

        ;
        status = clearNode(child.childNodes);
      });
      return status;
    } catch (error) {
      console.error(error);
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

  window.View = View;
  window.Component = Component$1;
  window.Router = Router;
  window.query = query;

  exports.Component = Component$1;
  exports.View = View;
  exports.global = global;

  return exports;

}({}));
