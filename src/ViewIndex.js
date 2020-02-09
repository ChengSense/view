import { resolver, clearNodes } from "./ViewResolver";
import { init, initCompiler } from "./ViewInit";
import { observer } from "./ViewObserve";
import { setScopes } from "./ViewScope";
import { Router } from "./ViewRouter";
import { query } from "./ViewElmemt";
import { slice } from "./ViewLang";

export let global = { $path: undefined };

export class View {
  constructor(app) {
    this.model = observer(app.model, watcher);
    this.action = app.action;
    this.watch = app.watch;
    this.filter = app.filter;
    this.component = {};
    this.componenter(app.component);
    this.creater(app);
  }
  creater(app) {
    this.content = { childNodes: [], children: [] };
    this.view = query(app.view)[0];
    this.ref = setRef(this.content, this);
    let node = initCompiler(init(this.view), [])[0];
    setScopes(this);
    resolver.view(this.view, node, this.model, this.content, this);
  }
  componenter(coms) {
    let list = Object.values(coms || {});
    list.forEach(com => {
      let name = com.name.toLowerCase();
      Reflect.set(this.component, name, com);
    });
  }
}

let watcher = {
  set(cache, newCache) {
    deepen(cache, newCache);
  },
  get(path) {
    global.$path = path;
  }
};

function setRef(content, we) {
  return new Proxy({}, {
    get(parent, prop) {
      let childNodes = content.childNodes
      let list = getRef(childNodes, prop, []);
      let node = list.shift();
      return node.childNodes[1];
    },
    set(parent, prop, app) {
      let childNodes = content.childNodes
      let list = getRef(childNodes, prop, []);
      let node = list.shift();
      resolver.component(new app(), node, we);
      return true;
    }
  })
}

function getRef(nodes, id, list) {
  nodes.every(function (child) {
    if (child["@".concat(id)]) {
      list.push(child);
      return false;
    }
    if (child.childNodes)
      getRef(child.childNodes, id, list);
    return !list.length;
  });
  return list;
}

export class Component {
  constructor(app) {
    this.model = app.model;
    this.action = app.action;
    this.watch = app.watch;
    this.filter = app.filter;
    this.creater(app);
  }
  creater(app) {
    this.content = { childNodes: [], children: [] };
    let view = query(app.view)[0];
    view.parentNode.removeChild(view);
    this.view = view.outerHTML;
  }
}

function clearNode(nodes, status) {
  try {
    nodes.every(child => {
      if (child.node) {
        let node = child.node.ownerElement || child.node;
        status = document.body.contains(node);
        return false;
      };
      status = clearNode(child.childNodes);
    });
    return status;
  } catch (error) {
    console.error(error)
  }
}

function deepen(cache, newCache) {
  if (cache && newCache) {
    cache.forEach(caches => {
      if (!caches) return;
      caches.forEach((nodes, we) => {
        slice(nodes).forEach(node => {
          if (clearNode([node]))
            resolver[node.resolver](node, we, newCache);
          else
            nodes.remove(node);
        })
      });
    });
  } else if (cache && !newCache) {
    cache.forEach(caches => {
      if (!caches) return;
      caches.forEach(nodes => {
        clearNodes(nodes)
      });
    });
  }
}

window.View = View;
window.Component = Component;
window.Router = Router;
window.query = query;