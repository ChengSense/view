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
    this.content = { childNodes: [], children: [] };
    this.model = app.model;
    this.action = app.action;
    this.watch = app.watch;
    this.methd = app.methd;
    app.view ? this.view(app) : this.component(app)
  }
  view(app) {
    app.model = observer(app.model, {
      set(cache, newCache) { deepen(cache, newCache); },
      get(path) { global.$path = path; }
    }, app.watch);

    this.model = app.model;
    var view = query(app.view);
    var node = initCompiler(init(slice(view)))[0];
    this.node = node;
    this.view = view[0];
    setScopes(this);
    resolver.view(this.view, node, app.model, this.content, this);
  }
  component(app) {
    var view = query(app.component);
    this.view = view[0];
    this.view.parentNode.removeChild(this.view);
    this.component = this.view.outerHTML;
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
  } catch (e) {
    console.log(e);
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
window.Router = Router;
window.query = query;