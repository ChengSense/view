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
    this.creater(app);
  }
  creater(app) {
    this.content = { childNodes: [], children: [] };
    this.view = query(app.view)[0];
    let node = initCompiler(init([this.view]))[0];
    setScopes(this);
    resolver.view(this.view, node, this.model, this.content, this);
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