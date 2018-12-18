import { init, initCompiler } from "./ViewInit";
import { inject, slice } from "./ViewLang";
import { resolver } from "./ViewResolver";
import { observe } from "./ViewObserve";
import { Router } from "./ViewRouter";
import { query } from "./ViewElmemt";

export let global = { $path: undefined };

export class View {
  constructor(app) {
    this.content = { childNodes: [], children: [] };
    this.model = app.model;
    this.action = app.action;

    observe(app.model, function set(cache, newCache) {
      deepen(cache, newCache);
    }, function get(path) {
      global.$path = path;
    });

    observe(app.flux, function set(cache, newCache) {
      deepen(cache, newCache);
    }, function get(path) {
      global.$path = path;
    });

    app.view ? this.view(app) : this.component(app)

  }
  view(app) {
    var view = query(app.view);
    var node = initCompiler(init(slice(view)))[0];
    this.node = node;
    this.view = view[0];
    this.flux = app.flux,
      this.components = app.components,
      inject(app.action, {
        $view: this.view,
        $model: app.model,
        $action: app.action
      });
    resolver["view"](this.view, node, app.model, this.content, this);
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
  cache.forEach((nodes, we) => {
    slice(nodes).forEach(node => {
      if (clearNode([node]))
        resolver[node.resolver](node, we, newCache);
      else
        nodes.remove(node);
    })
  });
}

window.View = View;
window.Router = Router;
window.query = query;