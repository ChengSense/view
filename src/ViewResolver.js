import { View, global } from "./ViewIndex";
import { each, slice, extention, blank } from "./ViewLang";
import { Compiler, compoNode } from "./ViewCompiler";
import { code, codex } from "./ViewScope";

export var resolver = {
  view: function (view, node, scope, content, we) {
    try {
      var doc = document.createDocumentFragment();
      new Compiler(doc, scope, slice(node.children), content, we);
      content.children = node.children;
      content.clas = node.clas;
      view.reappend(doc);
    } catch (e) {
      console.log(e);
    }
  },
  component: function (node, we) {
    try {
      let app = code(node.clas.nodeValue, node.scope);
      let $cache = global.$cache;
      node.path = [global.$path];
      if (blank(app)) return;
      extention(app.model, node.scope);
      var insert = insertion(node.childNodes);
      var childNodes = node.content.childNodes;
      clearNodes(node.childNodes);
      let component = new View({ view: app.component, model: app.model, action: app.action });
      let clasNodes = compoNode(insert, node, component);
      deeping(clasNodes, we, $cache);
      childNodes.replace(node, clasNodes);
      if (insert.parentNode)
        insert.parentNode.replaceChild(component.view, insert);
    } catch (e) {
      console.log(e);
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
    } catch (e) {
      console.log(e);
    }
  },
  each: function (node, we) {
    try {
      var insert = insertion(node.childNodes);
      var doc = document.createDocumentFragment();
      var childNodes = node.content.childNodes;
      clearNodes(node.childNodes);
      new Compiler(doc, node.scope, [node], node.content, we);
      childNodes.replace(node, childNodes.pop())
      if (insert.parentNode)
        insert.parentNode.replaceChild(doc, insert);
    } catch (e) {
      console.log(e);
    }
  },
  express: function (node, we) {
    try {
      node.node.nodeValue = codex(node.clas.nodeValue, node.scope);
      deeping(node, we, global.$cache);
      if (node.node.name == "value")
        node.node.ownerElement.value = node.node.nodeValue;
    } catch (e) {
      console.log(e);
    }
  },
  attribute: function (node, we) {
    try {
      var newNode = document.createAttribute(codex(node.clas.name, scope));
      deeping(node, we, global.$cache);
      newNode.nodeValue = node.clas.nodeValue;
      node.node.ownerElement.setAttributeNode(newNode);
      node.node.ownerElement.removeAttributeNode(node.node);
    } catch (e) {
      console.log(e);
    }
  }
};

export function deeping(clas, we, $cache) {
  let cache = $cache.get(we);
  if (cache) {
    cache.ones(clas)
  } else {
    $cache.set(we, [clas]);
  }
}

function insertion(nodes, node) {
  try {
    each(nodes, child => {
      if (child.node && child.node.parentNode) {
        node = child.node;
        child.node = null;
        return node;
      };
      node = insertion(child.childNodes);
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