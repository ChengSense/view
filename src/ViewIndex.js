import { observe } from "./ViewObserve";
import { query } from "./ViewElmemt";
import { init, initCompiler } from "./ViewInit";
import { each, slice, clone } from "./ViewLang";
import { resolver } from "./ViewResolver";
import { Router } from "./ViewRouter";


export let global = { $path: undefined };

export function View(app) {
  var content = { childNodes: [], children: [] };
  var attributes = [];

  observe(app.model, function set(path) {
    deepen(content, path, attributes);
  }, function get(path) {
    global.$path = path;
  });

  switch (app.view ? "view" : "component") {
    case "view":
      var view = query(app.view);
      var node = initCompiler(init(slice(view)))[0];
      this.content = content;
      this.model = app.model;
      this.node = node;
      this.view = view[0];
      resolver["view"](this.view, node, app.model, content, attributes);
      break;
    case "component":
      var view = query(app.component);
      this.view = view[0];
      this.view.parentNode.removeChild(this.view);
      this.content = content;
      this.model = app.model;
      this.component = this.view.outerHTML;
      break;
  }
}

function deepen(content, path, attributes) {
  each(slice(content.childNodes), function (node) {
    if (node.path && node.path.has(path)) {
      resolver[node.resolver](node, attributes);
      return true;
    }
    if (node.childNodes[0])
      deepen(node, path, attributes);
  });
  each(attributes, function (node) {
    if (!node.node.ownerElement.parentNode) {
      attributes.remove(node);
      return;
    }
    if (node.path && node.path.has(path))
      resolver[node.resolver](node, attributes);
  });
}

window.View = View;
window.Router = Router;
window.clone = clone;