import { each, slice, blank, extention } from "./ViewLang";
import { code, Code,codev, codex, Path, setVariable } from "./ViewScope";
import { $express, $expres, $component, $each, $when, $whec, $whea, $chen, $word, $event } from "./ViewExpress";
import { global } from "./ViewIndex";
import { resolver } from "./ViewResolver";

export function compiler(node, scopes, childNodes, content, shcope) {
  each(childNodes, function (child, index, childNodes) {
    switch (child.clas.nodeType) {
      case 1:
        if (child.clas.hasAttribute("each")) {
          var expreses = child.clas.getAttribute("each").split(":");
          var variable = expreses.shift().trim(), source = expreses.pop().trim(), id = expreses.shift();
          var dataSource = code(source, scopes);
          var clas = eachNode(null, node, child);
          content.childNodes.push(clas);
          binding(null, scopes, clas, content, shcope);
          each(dataSource, function (item, index) {
            var scope = Object.create(scopes || {});
            setVariable(scope, variable, global.$path);
            if (id) scope[id.trim()] = index.toString();
            var newNode = child.clas.cloneNode();
            newNode.removeAttribute("each");
            node.appendChild(newNode);
            var clasNodes = classNode(newNode, child);
            clas.childNodes.push(clasNodes);
            compiler(newNode, scope, slice(child.children), clasNodes, shcope);
            commom(newNode, scope, clasNodes, content, shcope);
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
              compiler(newNode, scopes, slice(child.children), clasNodes, shcope);
              commom(newNode, scopes, clasNodes, content, shcope);
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
          binding(null, scopes, clas, content, shcope);
          each(dataSource, slice(child.children), function (item, index, children) {
            var scope = Object.create(scopes || {});
            setVariable(scope, variable, global.$path);
            if (id) scope[id.trim()] = index.toString();
            var clasNodes = classNode(null, child);
            clas.childNodes.push(clasNodes);
            compiler(node, scope, slice(children), clasNodes, shcope);
          });
        } else if ($when.test(child.clas.nodeValue)) {
          var when = code(child.clas.nodeValue.replace($when, "$2"), scopes);
          var clas = whenNode(null, node, child, content, scopes, shcope);
          clas.children.push(childNodes.shift());
          if (when) {
            binding(null, scopes, clas, content, shcope);
            each(childNodes, function (child, index, childNodes) {
              if (!whem(child)) return true;
              clas.children.push(childNodes.shift());
            });
            each(slice(child.children), function (child, index, childNodes) {
              switch (child.clas.nodeType == 1 || $chen.test(child.clas.nodeValue)) {
                case true:
                  compiler(node, scopes, childNodes, clas, shcope);
                  break;
                default:
                  var newNode = child.clas.cloneNode();
                  node.appendChild(newNode);
                  var clasNodes = classNode(newNode, child);
                  clas.childNodes.push(clasNodes);
                  commom(newNode, scopes, clasNodes, clas, shcope);
                  break;
              }
              childNodes.shift();
            });
          } else if (when == undefined) {
            binding(null, scopes, clas, content, shcope);
            each(slice(child.children), function (child, index, childNodes) {
              switch (child.clas.nodeType == 1 || $chen.test(child.clas.nodeValue)) {
                case true:
                  compiler(node, scopes, childNodes, clas, shcope);
                  break;
                default:
                  var newNode = child.clas.cloneNode();
                  node.appendChild(newNode);
                  var clasNodes = classNode(newNode, child);
                  clas.childNodes.push(clasNodes);
                  commom(newNode, scopes, clasNodes, clas, shcope);
                  break;
              }
              childNodes.shift();
            });
          } else if (whem(childNodes[0])) {
            compiler(node, scopes, childNodes, clas, shcope);
          }
          return whem(child);
        } else {
          var newNode = child.clas.cloneNode();
          node.appendChild(newNode);
          var clasNodes = classNode(newNode, child);
          content.childNodes.push(clasNodes);
          commom(newNode, scopes, clasNodes, content, shcope);
        }
        break;
    }
    childNodes.shift();
  });
}

function commom(node, scope, clas, content, shcope) {
  each(node.attributes, function (child) {
    let clasNodes = attrNode(child, scope, child.cloneNode());
    commom(child, scope, clasNodes, null, shcope);
  });
  if (new RegExp($component).test(node.nodeValue)) {
    comNode(node, scope, clas, content);
    resolver["component"](clas);
  } else if (new RegExp($express).test(node.nodeValue)) {
    binding(node, scope, clas, content, shcope);
    node.nodeValue = codex(node.nodeValue, scope);
  }
  if (new RegExp($event).test(node.name)) {
    bind(node, scope);
  }
}

function bind(node, scope) {
  node.name.replace($event, function (key) {
    key = key.replace($event, "$1");
    let owner = node.ownerElement;
    owner.on(key, function (event) {
      codev(node.nodeValue, scope, event);
    })
  });
}

function whem(child) {
  if (child) return new RegExp($whec).test(child.clas.nodeValue);
}

function binding(node, scope, clas, content, shcope) {
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
          dep(key, scope, clas, shcope);
          if (clas.clas.name == "value") model(node, scope);
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

function dep(key, scope, clas, shcope) {
  key.replace($word, function (key) {
    if (code(key, scope) == undefined || global.$path == undefined) return;
    if (clas.clas.nodeType == 2) {
      let attres = global.$attres.get(shcope);
      if(attres){
        attres.push(clas) 
      }else{
        global.$attres.set(shcope, [clas]);
      }
    }
    clas.path.push(global.$path);
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

function whenNode(newNode, node, child, content, scopes, shcope) {
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
    binding(null, scopes, content, shcope);
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

export function compoNode(node, child, component) {
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