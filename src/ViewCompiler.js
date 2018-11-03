import { global } from "./ViewIndex";
import { blank, forEach, slice, whiles } from "./ViewLang";
import { deeping, resolver } from "./ViewResolver";
import { code, codev, codex, Path, setVariable } from "./ViewScope";
import { $chen, $component, $each, $event, $expres, $express, $whea, $whec, $when, $word } from "./ViewExpress";

export function Compiler(node, scopes, childNodes, content, we) {

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
            var scope = Object.create(scopes || {});
            setVariable(scope, variable, global.$path);
            if (id) scope[id.trim()] = index.toString();
            var newNode = child.clas.cloneNode();
            newNode.removeAttribute("each");
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
            var scope = Object.create(scopes || {});
            setVariable(scope, variable, global.$path);
            if (id) scope[id.trim()] = index.toString();
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
      let clas = attrNode(child, scope, child.cloneNode());
      if (new RegExp($expres).test(child.nodeValue)) {
        binding.attrExpress(child, scope, clas);
        child.nodeValue = codex(child.nodeValue, scope);
      }
      bind(child, scope);
    });

    function bind(node, scope) {
      node.name.replace($event, function (key) {
        key = key.replace($event, "$1");
        let owner = node.ownerElement;
        owner.on(key, function (event) {
          codev(node.nodeValue, scope, event);
        })
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
    else if (express = new RegExp($express).exec(node.nodeValue)) {
      binding.express(node, scope, clas, express[0]);
      node.nodeValue = code(express[1], scope);
    }
  }

  function whem(child) {
    if (child) return new RegExp($whec).test(child.clas.nodeValue);
  }

  let binding = {
    attrEach(node, scope, clas, content, value) {
      if (global.$cache == undefined) return;
      clas.resolver = "each";
      clas.content = content;
      clas.scope = scope;
      clas.node = node;
      deeping(clas, we, global.$cache);
    },
    each(node, scope, clas, content, value) {
      if (global.$cache == undefined) return;
      clas.resolver = "each";
      clas.content = content;
      clas.scope = scope;
      clas.node = node;
      deeping(clas, we, global.$cache);
    },
    when(node, scope, clas) {
      var nodeValue = clas.clas.nodeValue;
      let whens = new RegExp($when).exec(nodeValue);
      if (!whens) return;
      let key = whens.pop();
      clas.resolver = "when";
      clas.scope = scope;
      clas.node = node;
      dep(key, scope, clas);
    },
    express(node, scope, clas, key) {
      clas.resolver = "express";
      clas.scope = scope;
      clas.node = node;
      dep(key, scope, clas);
    },
    attrExpress(node, scope, clas) {
      var nodeValue = clas.clas.nodeValue;
      nodeValue.replace($expres, function (key) {
        clas.resolver = "express";
        clas.scope = scope;
        clas.node = node;
        dep(key, scope, clas);
      });
      if (clas.clas.name == "value")
        model(node, scope);
    }
  }

  function dep(key, scope, clas) {
    key.replace($word, function (key) {
      code(key, scope);
      if (global.$cache == undefined) return;
      deeping(clas, we, global.$cache);
    });
  }

  function model(node, scope) {
    var owner = node.ownerElement, handle;
    owner._express = node.nodeValue.replace($express, "$1");
    owner.on("change", handle = function () {
      new Function('scope',
        `
        scope${Path(owner._express)}='${owner.value.replace(/(\'|\")/g, "\\$1")}';
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
          children: [],
          scope: child.scope,
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
      children: [],
      content: clas,
      childNodes: []
    });
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

  compiler(node, scopes, childNodes, content);

}

export function compoNode(node, child, component) {
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
      children: [],
      scope: child.scope,
      childNodes: []
    }, component.content]
  };
}