import { query } from "./ViewElmemt";
import { init, initCompiler } from "./ViewInit";
import { clone, slice } from "./ViewLang";
import { observe } from "./ViewObserve";
import { resolver } from "./ViewResolver";
import { Router } from "./ViewRouter";

export let global = { $path: undefined };

export class View {
  constructor(app) {
    this.content = { childNodes: [], children: [] };
    this.model = app.model;
    this.action = app.action;

    observe(app.model, function set(oldValue, cache) {
      deepen(cache);
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
    app.model.$action = app.action;
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

function deepen(cache) {
  cache.forEach((nodes, we) => {
    slice(nodes).forEach(node => {
      if (clearNode([node])) 
        resolver[node.resolver](node, we);
       else 
        nodes.remove(node);
    })
  });
}

window.View = View;
window.Router = Router;
window.clone = clone;