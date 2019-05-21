import { Compiler, compoNode } from "./ViewCompiler";
import { blank, each, extention, slice } from "./ViewLang";
import { global, View } from "./ViewIndex";
import { codec, codex } from "./ViewScope";

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
      let app = codec(node.clas.nodeValue, node.scope, we);
      let $cache = global.$cache;
      if (blank(app)) return;
      extention(app.model, node.scope);
      var insert = insertion(node.childNodes);
      var childNodes = node.content.childNodes;
      clearNodes(node.childNodes);
      let component = new View({ view: app.component, model: app.model, action: app.action, flux: app.flux });
      let clasNodes = compoNode(insert, node, component);
      setCache(clasNodes, we, $cache);
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
  arrayEach: function (node, we, m, nodes) {
    try {
      var insert = insertNode([node.childNodes[m]]);
      var doc = document.createDocumentFragment();
      var child = { clas: node.clas, children: node.children, scope: node.scope };
      var content = { childNodes: [], children: [] };
      new Compiler(doc, node.scope, [child], content, we);
      doc.removeChild(doc.childNodes[0]);
      var childNodes = slice(content.childNodes[0].childNodes);
      childNodes.splice(0, 1, m + 1, 0);
      node.childNodes.splices(childNodes);
      nodes.remove(content.childNodes[0]);
      if (insert.parentNode) insert.after(doc);
    } catch (e) {
      console.log(e);
    }
  },
  express: function (node, we, cache) {
    try {
      node.node.nodeValue = codex(node.clas.nodeValue, node.scope);
      setCache(node, we, cache);
      if (node.node.name == "value")
        node.node.ownerElement.value = node.node.nodeValue;
    } catch (e) {
      console.log(e);
    }
  },
  attribute: function (node, we, cache) {
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

export var cacher = function (cache, scope, add) {
  cache.forEach((nodes, we) => {
    nodes.forEach(node => {
      try {
        if (arrayEach[node.resolver])
          arrayEach[node.resolver](node, scope, add, we, nodes);
        else
          resolver[node.resolver](node, we, cache);
      } catch (e) {
        console.error(e);
      }
    })
  });
};

var arrayEach = {
  each: function (node, scope, add, we, children) {
    try {
      var l = scope.length;
      if (add > 0) {
        var nodes = node.childNodes.splice(l + 1);
        clearNodes(nodes);
        resolver.arrayEach(node, we, node.childNodes.length - 1, children);
      }
      else {
        var nodes = node.childNodes.splice(l + 1);
        clearNodes(nodes);
      }
    } catch (e) {
      console.error(e);
    }
  }
};

export function setCache(clas, we, $cache) {
  if (!$cache) return;
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

function insertNode(nodes, node) {
  try {
    each(nodes, child => {
      if (child.node && child.node.parentNode) {
        node = child.node;
        return node;
      }
      if (child.childNodes.length) {
        let children = child.childNodes[child.childNodes.length - 1];
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

export function clearNodes(nodes) {
  nodes.forEach(function (child) {
    if (child.node && child.node.parentNode)
      return child.node.parentNode.removeChild(child.node);
    if (child.childNodes)
      clearNodes(child.childNodes);
  });
}