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

  var $lang = /(@each|@when|\.when)\s*\((.*)\)\s*\{|\.when\s*\{|\{([^\{\}]*)\}|\}/g;
  var $chen = /(@each|@when|\.when)\s*(\((.*)\))?\s*\{/;
  var $express = /\{([^\{\}]*)\}/;
  var $when = /,\s*\.when/g;

  function toChars(html) {
    return html.split("");
  }
  function selfClose(name) {
    var node = document.createElement(name);
    return !new RegExp(/<\/\w+>/).test(node.outerHTML);
  }
  function forEach(object, method) {
    Object.keys(object).forEach(function (key) {
      var value = Reflect.get(object, key);
      method(value, key);
    });
  }

  var TagNode =
  /*#__PURE__*/
  function () {
    function TagNode(name) {
      _classCallCheck(this, TagNode);

      this.type = "TAG";
      this.name = name;
      this.attrs = {};
    }

    _createClass(TagNode, [{
      key: "setName",
      value: function setName(attr) {
        if (attr == "") {
          return;
        } else if (this.name) {
          var index = attr.indexOf("=");
          var name = attr.slice(0, index);
          var value = attr.slice(index + 2, attr.length - 1);
          Reflect.set(this.attrs, name, value);
        } else {
          this.name = attr;
        }
      }
    }, {
      key: "react",
      value: function react() {
        if (this.name.startsWith("/")) {
          return ")";
        } else if (selfClose(this.name)) {
          var attrs = JSON.stringify(this.attrs);
          return "React.createRender(\"".concat(this.name, "\",").concat(attrs, ")");
        } else {
          var _attrs = JSON.stringify(this.attrs);

          return "React.createRender(\"".concat(this.name, "\",").concat(_attrs);
        }
      }
    }]);

    return TagNode;
  }();
  var FuncNode =
  /*#__PURE__*/
  function () {
    function FuncNode(list, name, text) {
      _classCallCheck(this, FuncNode);

      this.type = "FUNC";
      this.name = name;
      this.attrs = {};
      this.setName(list, text);
    }

    _createClass(FuncNode, [{
      key: "setName",
      value: function setName(list, text) {
        if (this.name.startsWith(".when")) {
          list.push(this);
          var chen = this.name.match($chen);
          this.attrs = chen[3];
          this.name = chen[1];
        } else if (this.name.startsWith("}")) {
          var name = text.slice(0, text.indexOf(this.name));
          list.push(new TextNode(name));
          list.push(this);
        } else if (this.name.startsWith("{")) {
          var _name = text.slice(0, text.indexOf(this.name));

          list.push(new TextNode(_name));
          list.push(new TextNode(this.name));
        } else {
          var _name2 = text.slice(0, text.indexOf(this.name));

          list.push(new TextNode(_name2));
          list.push(this);

          var _chen = this.name.match($chen);

          this.attrs = _chen[3];
          this.name = _chen[1];
        }
      }
    }, {
      key: "react",
      value: function react() {
        if (this.name.startsWith("}")) {
          return ")";
        } else {
          var attrs = JSON.stringify(this.attrs);
          return "React.createFunction(\"".concat(this.name, "\",").concat(attrs);
        }
      }
    }]);

    return FuncNode;
  }();
  var TextNode =
  /*#__PURE__*/
  function () {
    function TextNode(name) {
      _classCallCheck(this, TextNode);

      this.type = "TEXT";
      this.name = name;
    }

    _createClass(TextNode, [{
      key: "setName",
      value: function setName(attr) {
        this.name = attr;
      }
    }, {
      key: "react",
      value: function react() {
        var name = this.name.replace(/\n/g, "");
        return "React.createRender(\"".concat(name, "\",null)");
      }
    }]);

    return TextNode;
  }();
  var Render =
  /*#__PURE__*/
  function () {
    function Render(scope, params, func) {
      _classCallCheck(this, Render);

      this.func = func;
      this.scope = scope;
      this.params = params;
      this.status = null;
      this.value = new Map();
    }

    _createClass(Render, [{
      key: "when",
      value: function when(status, method) {
        var map = this.value,
            list = [];
        var scope = this.scope;

        if (this.status == null && status) {
          this.status = status;
          setCache(global.cache, method, scope, list);
          global.cache = new Map();
          var methods = method(this.scope);
          map.set(scope, list);
          methods.forEach(function (func) {
            return render(list, scope, func);
          });
        } else if (this.status == null && status == undefined) {
          this.status = status;
          setCache(global.cache, method, scope, list);
          global.cache = new Map();

          var _methods = method(this.scope);

          map.set(scope, list);

          _methods.forEach(function (func) {
            return render(list, scope, func);
          });
        }

        return this;
      }
    }, {
      key: "forEach",
      value: function forEach$1(object, method) {
        var _this = this;

        var map = this.value,
            arr = [];
        var params = this.params.split(",");
        var field = params[0],
            id = params[1];
        setCache(global.cache, this.func, this.scope, arr);
        global.cache = new Map();

        forEach(object, function (value, index) {
          var list = [];
          var scope = Object.create(_this.scope.$target);
          scope[id] = index;
          scope = new Proxy(scope, handler(_this.scope, object, field, index));
          setCache(global.cache, method, scope, list);
          global.cache = new Map();
          var methods = method(scope);
          map.set(scope, list);
          methods.forEach(function (func) {
            return render(list, scope, func);
          });
          arr.push.apply(list);
        });

        return this;
      }
    }, {
      key: "toString",
      value: function toString() {
        return this.value.join("");
      }
    }]);

    return Render;
  }();

  function render(list, scope, funcNode) {
    var child = funcNode(scope);

    if (child instanceof Render) {
      list.push.apply(child.value);
    } else {
      list.push(child);
    }
  }

  var React = {
    createFunction: function createFunction(name, param) {
      for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        children[_key - 2] = arguments[_key];
      }

      if ("@when" == name) {
        return "\n _scope=>new Render(_scope,null,arguments.callee).when(".concat(ReactScope(param), ", (_scope) => [").concat(children, "])");
      } else if (".when" == name) {
        return "\n .when(".concat(ReactScope(param), ", (_scope) => [").concat(children, "])");
      } else if ("@each" == name) {
        var params = param.split(":"),
            object = params.pop();
        return "\n _scope=>new Render(_scope,'".concat(params, "',arguments.callee).forEach(").concat(ReactScope(object), ", (_scope) => [").concat(children, "])");
      }
    },
    createRender: function createRender(name, attr) {
      var express;

      if (attr) {
        for (var _len2 = arguments.length, children = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
          children[_key2 - 2] = arguments[_key2];
        }

        return "\n _scope=>React.createElement(\"".concat(name, "\",_scope,arguments.callee,").concat(JSON.stringify(attr), ",").concat(children, ")");
      } else if (express = name.match($express)) {
        return "\n _scope=>React.createElement(".concat(ReactScope(express[1]), ",_scope,arguments.callee,null)");
      } else {
        return "\n _scope=>React.createElement(\"".concat(name, "\",_scope,arguments.callee,null)");
      }
    },
    createElement: function createElement(name, scope, func, attr) {
      if (attr) {
        var element = document.createElement(name);

        for (var _len3 = arguments.length, children = new Array(_len3 > 4 ? _len3 - 4 : 0), _key3 = 4; _key3 < _len3; _key3++) {
          children[_key3 - 4] = arguments[_key3];
        }

        children.forEach(function (funcNode) {
          var child = funcNode(scope);
          child instanceof Render ? child.value.forEach(function (a) {
            return a.forEach(function (c) {
              return element.appendChild(c);
            });
          }) : element.appendChild(child);
        });
        setCache(global.cache, func, scope, [element]);
        global.cache = new Map();
        setAttribute(element, attr);
        return element;
      } else {
        var _element = document.createTextNode(name);

        setCache(global.cache, func, scope, [_element]);
        global.cache = new Map();
        return _element;
      }
    }
  };

  function setAttribute(element, attr) {
    forEach(attr, function (value, name) {
      if (name.startsWith("@")) {
        bind(element, name.slice(1), value, we.action);
      } else {
        var attribute = document.createAttribute(name);
        attribute.value = value;
        element.setAttributeNode(attribute);
      }
    });
  }

  function bind(owner, key, value, action) {
    var array = value.match(/(.*)\((.*)\)/);

    if (array) {
      var name = array[1];
      var method = Reflect.get(action, name);
      owner.on(key, method, we.model, array[2]);
    } else {
      var _method = Reflect.get(action, value);

      owner.on(key, _method, we.model);
    }
  }

  function setCache(cache, func, scope, child) {
    cache.forEach(function (value) {
      var cache = value;

      if (cache) {
        cache.set(func, {
          scope: scope,
          child: child
        });
      }
    });
  }

  function ReactCode(express) {
    return new Function('React', "return ".concat(express, ";"))(React);
  }
  function RenderCode(express, we) {
    window.we = we;
    return new Function('we', 'React', 'Render', "return ".concat(express, ";\n    "))(we, React, Render);
  }
  function ReactScope(_express) {
    if (!_express) return;
    var express, c;

    _express.split("").reduce(function (a, b) {
      if (!express && a.match(/\w/)) {
        express = "_scope.".concat(a);
      }

      if (c == "'" && a == "'") {
        c = null;
        express = express.concat(b);
        return b;
      } else if (c == "'") {
        express = express.concat(b);
        return b;
      } else if (a == "'") {
        c = a;
        express = express.concat(b);
        return b;
      } else if (a.match(/\W/) && !a.match(/\.|\$|_/) && b.match(/\w/) && !b.match(/\d/)) {
        express = express.concat("_scope.").concat(b);
        return b;
      } else {
        express = express.concat(b);
        return b;
      }
    });

    return express;
  }
  function handler(proto, scope, field, key) {
    return {
      get: function get(parent, prop) {
        if (field == prop) return Reflect.get(scope, key);
        if ("".concat(field, "$") == prop) return Reflect.get(scope, "".concat(key, "$"));
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

  function AST(html) {
    var list = [];
    var open = "<",
        quote = "\"",
        close = ">";
    var chem = null,
        node = null,
        token = null;
    var chars = toChars(html);
    chars.reduce(function (a, b) {
      if (a == open) {
        var c = b;
        token = close;
        node = new TagNode();
        return c;
      } else if (token == quote && b == quote) {
        var _c = a.concat(b);

        node.setName(_c.trim());
        token = close;
        return "";
      } else if (token == close && b == close) {
        var _c2 = a;
        token = null;
        node.setName(_c2);
        list.push(node);
        node = new TextNode();
        return "";
      } else if (b == quote) {
        var _c3 = a.concat(b);

        token = quote;
        return _c3;
      } else if (b == open) {
        node.setName(a);
        list.push(node);
        return b;
      } else if (node.type == "TAG" && !node.name && b == " ") {
        node.setName(a);
        return "";
      } else if (node.type == "TEXT" && (chem = a.match($lang))) {
        new FuncNode(list, chem[0], a);
        return b;
      } else {
        var _c4 = a.concat(b);

        return _c4;
      }
    });
    return list;
  }
  function Transfer(html) {
    var list = AST(html).filter(function (a) {
      return a.name.trim() != "";
    });
    var express = list.map(function (a) {
      return a.react();
    }).join().trim();
    var func = ReactCode(express).replace($when, ".when").trim();
    return func;
  }

  function observer(target, watcher, we) {
    return new Proxy(target, handler$1(watcher, we));
  }

  function handler$1(watcher, we, root) {
    var values = new Map(),
        caches = new Map();
    return {
      get: function get(parent, prop, proxy) {
        if (prop == "$target") return parent;
        var value = values.get(prop);
        var path = root ? "".concat(root, ".").concat(prop) : prop;
        global.cache["delete"](root);
        global.cache.set(path, caches.get(prop));
        if (value != undefined) return value;
        value = Reflect.get(parent, prop);
        if (_typeof(value) == "object") value = new Proxy(value, handler$1(watcher, we, path));
        values.set(prop, value);
        caches.set(prop, new Map());
        global.cache["delete"](root);
        global.cache.set(path, caches.get(prop));
        watcher.get(path);
        return value;
      },
      set: function set(parent, prop, val, proxy) {
        var oldValue = values.get(prop);
        var oldCache = caches.get(prop);
        values["delete"](prop);
        caches["delete"](prop);
        Reflect.set(parent, prop, val.$target || val);
        watcher.set(oldCache, we);
        return true;
      }
    };
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
            var args = param ? [param] : [];
            args.push(event);
            method.apply(scope, args);
          });
        });
      }, false);
    } else if (this.attachEvent) {
      this.attachEvent("on".concat(type), function (event) {
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
      element["on".concat(type)] = function (event) {
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
      this.detachEvent("on".concat(type), handler);
    } else {
      element["on".concat(type)] = null;
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
      this.innerHTML = "";
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
      forEach(this, function (node) {
        node.on(type, call);
      });
      return this;
    },
    off: function off(type, call) {
      forEach(this, function (node) {
        node.off(type, call);
      });
      return this;
    }
  });

  var global = {
    $path: null,
    cache: new Map()
  };
  var View =
  /*#__PURE__*/
  function () {
    function View(app) {
      _classCallCheck(this, View);

      this.view = app.view;
      this.model = observer(app.model, watcher, this);
      this.action = app.action;
      this.watch = app.watch;
      this.filter = app.filter;
      this.creater(app);
    }

    _createClass(View, [{
      key: "creater",
      value: function creater(app) {
        this.view = Transfer(this.view);
        console.warn(this.view);
        this.node = RenderCode(this.view, this)(this.model);
      }
    }]);

    return View;
  }();
  var watcher = {
    set: function set(cache, we) {
      cache.forEach(function (param, func) {
        var funcNodes = func(param.scope);
        var element = param.child[0];
        if (!element) return;
        funcNodes = Array.isArray(funcNodes) ? funcNodes : [funcNodes];
        funcNodes.forEach(function (funcNode) {
          var child = funcNode(param.scope);
          child instanceof Render ? child.value.forEach(function (a) {
            return a.forEach(function (c) {
              return element.appendChild(c);
            });
          }) : element.appendChild(child);
          element.parentNode.appendChild(child);
        });
        param.child.forEach(function (a) {
          return a.parentNode.removeChild(a);
        });
      });
    },
    get: function get(path) {}
  };
  window.View = View;

  exports.React = React;
  exports.Render = Render;
  exports.View = View;
  exports.global = global;
  exports.query = query;

  return exports;

}({}));
