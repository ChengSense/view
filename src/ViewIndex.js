import { observe } from "./ViewObserve";
import { query } from "./ViewElmemt";
import { init, initCompiler } from "./ViewInit";
import { each, slice, clone } from "./ViewLang";
import { resolver } from "./ViewResolver";
import { Router } from "./ViewRouter";

export let global = { $path: undefined };

export function View(app) {
  var content = { childNodes: [], children: [] };
  var we = this;

  observe(app.model, function set(path) {
    deepen(global.$cache.get(we), we);
  }, function get(path) {
    global.$path = path;
  });

  switch (app.view ? "view" : "component") {
    case "view":
      var view = query(app.view);
      var node = initCompiler(init(slice(view)))[0];
      this.content = content;
      this.model = app.model;
      this.action = app.action;
      this.node = node;
      this.view = view[0];
      app.model.$action = app.action;
      resolver["view"](this.view, node, app.model, content, we);
      break;
    case "component":
      var view = query(app.component);
      this.view = view[0];
      this.view.parentNode.removeChild(this.view);
      this.content = content;
      this.model = app.model;
      this.action = app.action;
      this.component = this.view.outerHTML;
      break;
  }
}

export function deepen(cache, we) {
  cache.forEach((nodes, we) => {
    nodes.forEach(node => {
      resolver[node.resolver](node, we);
    });
  });
}

window.View = View;
window.Router = Router;
window.clone = clone;