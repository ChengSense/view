import { observe } from "./ViewObserve";
import { query } from "./ViewElmemt";
import { init, initCompiler } from "./ViewInit";
import { each, slice, clone } from "./ViewLang";
import { resolver } from "./ViewResolver";
import { Router } from "./ViewRouter";

export let global = { $path: undefined };

export class View {
  constructor(app) {
    this.content = { childNodes: [], children: [] };
    this.model = app.model;
    this.action = app.action;

    observe(app.model, function set(path, attres, $attres) {
      deepen(attres, $attres);
    }, function get(path) {
      global.$path = path;
    });

    app.view ? this.view(app) : this.component(app);
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

function deepen(attres, $attres) {
  attres.forEach((attre, we) => {
    each(attre, function (node) {
      resolver[node.resolver](node, we, $attres);
    });
  })
}

window.View = View;
window.Router = Router;
window.clone = clone;