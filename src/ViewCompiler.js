import { global } from "./ViewIndex";
import { blank, forEach, slice, whiles } from "./ViewLang";
import { setCache, resolver } from "./ViewResolver";
import { code, codex, Path, handler } from "./ViewScope";
import { $chen, $component, $each, $event, $expres, $express, $whea, $whec, $when, } from "./ViewExpress";

export function Compiler(node, scopes, childNodes, content, we) {

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
          binding.attrEach(null, scopes, clas, content, source);
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
          var field = expreses.shift().trim();
          var source = expreses.pop().trim();
          var id = expreses.shift();
          var sources = code(source, scopes);
          var clas = eachNode(null, node, child);
          content.childNodes.push(clas);
          binding.each(null, scopes, clas, content, source);
          let children = slice(child.children);
          forEach(sources, function (item, index) {
            var scope = Object.create(scopes.$target);
            if (id) scope[id.trim()] = index;
            scope = new Proxy(scope, handler(scopes, field, sources, index));
            var clasNodes = classNode(null, child);
            clas.childNodes.push(clasNodes);
            compiler(node, scope, slice(children), clasNodes);
          });
        }
        else if ($when.test(child.clas.nodeValue)) {
          let whex = child.clas.nodeValue.replace($when, "$2");
          var when = code(whex, scopes);
          var clas = whenNode(null, node, child, content, scopes);
          clas.children.push(childNodes.shift());
          if (when) {
            binding.when(null, scopes, clas);
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
            binding.when(null, scopes, clas);
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
        binding.attrExpress(child, scope, clas, child.nodeValue);
        child.nodeValue = codex(child.nodeValue, scope, we);
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
      node.nodeValue = code(express[1], scope);
      binding.express(node, scope, clas, express[1]);
    }
  }

  function whem(child) {
    if (child) return new RegExp($whec).test(child.clas.nodeValue);
  }

  let binding = {
    attrEach(node, scope, clas, content, _express) {
      clas.resolver = "each";
      clas.content = content;
      clas.scope = scope;
      clas.node = node;
      setCache(clas, we, _express);
    },
    each(node, scope, clas, content, _express) {
      clas.resolver = "each";
      clas.content = content;
      clas.scope = scope;
      clas.node = node;
      setCache(clas, we, _express);
    },
    when(node, scope, clas) {
      var _express = clas.clas.nodeValue;
      let whens = new RegExp($when).exec(_express);
      if (!whens) return;
      clas.resolver = "when";
      clas.scope = scope;
      clas.node = node;
      setCache(clas, we, _express);
    },
    express(node, scope, clas, _express) {
      clas.resolver = "express";
      clas.scope = scope;
      clas.node = node;
      setCache(clas, we, _express);
    },
    attrExpress(node, scope, clas, _express) {
      clas.resolver = "express";
      clas.scope = scope;
      clas.node = node;
      setCache(clas, we, _express);
    }
  }

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
          let express = `${_express}='${_value}';`
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
          let express = `${_express}='${_value}';`
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
          let express = `${_express}='${_value}';`
          new Function('scope', express)(scope);
        }, scope);
      } catch (error) {
        console.error(error);
      }
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

export function compoNode(node, child, component) {
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