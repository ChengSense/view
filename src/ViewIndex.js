import { observe } from "./ViewObserve";
import { query } from "./ViewElmemt";
import { init, initCompiler } from "./ViewInit";
import { each, slice, clone } from "./ViewLang";
import { resolver } from "./ViewResolver";
import { Router } from "./ViewRouter";


export let global = { $path: undefined };

export function View(app) {
  var content = { childNodes: [], children: [] };
  var shcope = this;

  observe(app.model, function set(path) {
    deepen(content, path, shcope);
    attrDeepen(global.$attres.get(shcope));
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
      resolver["view"](this.view, node, app.model, content, shcope);
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

function deepen(content, path, shcope) {
  each(content.childNodes, function (node) {
    if (node.path && node.path.has(path)) {
      resolver[node.resolver](node, shcope);
      return false;
    }
    if (node.childNodes[0])
      deepen(node, path, shcope);
  });
}

function attrDeepen(attres) {
  each(slice(attres), function (node) {
    if (node.node && !node.node.ownerElement.parentNode)
      attres.remove(node);
    resolver[node.resolver](node);
  });
  console.log();
}

window.View = View;
window.Router = Router;
window.clone = clone;