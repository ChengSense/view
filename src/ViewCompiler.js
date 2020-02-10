import { global } from "./ViewIndex";
import { blank, forEach, farEach } from "./ViewLang";
import { setCache, resolver } from "./ViewResolver";
import { code, codeo, codex, handler } from "./ViewScope";
import { $each, $express, $whea, $when, } from "./ViewExpress";

export function Compiler(node, scopes, childNodes, content, we) {

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
      comNode(scope, clas, content);
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
  }

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

  function comNode(scope, clas, content) {
    clas.scope = scope;
    clas.resolver = "component";
    clas.content = content;
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