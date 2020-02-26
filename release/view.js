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
  function attrRender(object) {
    var list = [];
    forEach(object, function (value, name) {
      var express = "`".concat(value.replace($express, "${$1}"), "`");
      list.push("\"".concat(name, "\":").concat(express));
    });
    return "{".concat(list, "}");
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
          return "\nReact.createRender(\"".concat(this.name, "\",").concat(attrs, ")");
        } else {
          var _attrs = JSON.stringify(this.attrs);

          return "\nReact.createRender(\"".concat(this.name, "\",").concat(_attrs);
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
          return "\nReact.createFunction(\"".concat(this.name, "\",").concat(attrs);
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
        return "\nReact.createRender(\"".concat(name, "\",null)");
      }
    }]);

    return TextNode;
  }();
  var Render =
  /*#__PURE__*/
  function () {
    function Render() {
      _classCallCheck(this, Render);

      this.status = null;
      this.value = null;
    }

    _createClass(Render, [{
      key: "when",
      value: function when(status, method) {
        if (this.status == null && status) {
          this.status = status;
          this.value = method();
        } else if (this.status == null && status == undefined) {
          this.status = status;
          this.value = method();
        }

        return this;
      }
    }, {
      key: "forEach",
      value: function forEach$1(object, method) {
        var list = this.value = [];

        forEach(object, function (value, key) {
          var arr = method(value, key);
          list.push.apply(list, arr);
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
  var React = {
    createFunction: function createFunction(name, param) {
      for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        children[_key - 2] = arguments[_key];
      }

      if ("@when" == name) {
        return "\nnew Render().when(".concat(param, ", () => [").concat(children, "])");
      } else if (".when" == name) {
        return "\n.when(".concat(param, ", () => [").concat(children, "])");
      } else if ("@each" == name) {
        var params = param.split(":"),
            object = params.pop();
        return "\nnew Render().forEach(".concat(object, ", (").concat(params, ") => [").concat(children, "])");
      }
    },
    createRender: function createRender(name, attr) {
      var express;

      if (attr) {
        for (var _len2 = arguments.length, children = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
          children[_key2 - 2] = arguments[_key2];
        }

        return "\nReact.createElement(\"".concat(name, "\",").concat(attrRender(attr), ",").concat(children, ")");
      } else if (express = name.match($express)) {
        return "\nReact.createElement(".concat(express[1], ",null)");
      } else {
        return "\nReact.createElement(\"".concat(name, "\",null)");
      }
    },
    createElement: function createElement(name, attr) {
      if (attr) {
        var element = document.createElement(name);

        for (var _len3 = arguments.length, children = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
          children[_key3 - 2] = arguments[_key3];
        }

        children.forEach(function (a) {
          return a instanceof Render ? a.value.forEach(function (b) {
            return element.appendChild(b);
          }) : element.appendChild(a);
        });
        setAttribute(element, attr);
        return element;
      } else {
        var _element = document.createTextNode(name);

        return _element;
      }
    }
  };

  function setAttribute(element, attr) {
    forEach(attr, function (value, name) {
      var attribute = document.createAttribute(name.replace("@", "on"));
      attribute.value = value;
      element.setAttributeNode(attribute);
    });
  }

  function ReactCode(express) {
    return new Function('React', "return ".concat(express, ";"))(React);
  }
  function RenderCode(express, scope) {
    var keys = Object.keys(scope);
    return new Function('scope', 'React', 'Render', "let {".concat(keys, "}=scope;\n     return ").concat(express, ";\n    "))(scope, React, Render);
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
    return new Proxy(target, handler(watcher, we));
  }

  function handler(watcher, we, root) {
    var values = new Map(),
        caches = new Map();
    return {
      get: function get(parent, prop, proxy) {
        if (prop == "$target") return parent;
        var value = values.get(prop);
        if (value != undefined) return value;
        var path = root ? "".concat(root, ".").concat(prop) : prop;
        value = Reflect.get(parent, prop);
        if (_typeof(value) == "object") value = new Proxy(value, handler(watcher, we, path));
        values.set(prop, value);
        caches.set(prop, new Map());
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
        var _this = this;

        methods.forEach(function (params, method) {
          params.forEach(function (param) {
            var args = param ? code("[".concat(param, "]"), scope) : [];
            args.push(event);
            method.apply(_this, args);
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
      forEach(slice(this.childNodes), function (child) {
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
        this.node = RenderCode(this.view, this.model);
      }
    }]);

    return View;
  }();
  var watcher = {
    set: function set(cache, we) {
      var view = RenderCode(we.view, we.model);
      document.querySelector("app").innerHTML = view;
    },
    get: function get(path) {}
  };
  window.View = View;

  exports.React = React;
  exports.Render = Render;
  exports.View = View;
  exports.query = query;

  return exports;

}({}));
