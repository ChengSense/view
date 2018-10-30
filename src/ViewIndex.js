import { observe } from "./ViewObserve";
import { query } from "./ViewElmemt";
import { init, initCompiler } from "./ViewInit";
import { slice, clone } from "./ViewLang";
import { resolver } from "./ViewResolver";
import { Router } from "./ViewRouter";
import { Path } from "./ViewScope";

export let global = { $path: undefined };

export function View(app) {
  var content = { childNodes: [], children: [] };
  var we = this;

  observe(app.model, function set(oldValue, cache) {
    clearCache(oldValue, app.model);
    deepen(cache);
  }, function get(path) {
    global.$path = path;
  });

  function clearCache(object) {
    if (typeof object == "object" && !(object instanceof View))
      setTimeout(() => {
        Object.keys(object).forEach(prop => {
          var value = object[prop];
          var cache = global.$cache;
          deepen(cache);
          cache.forEach(nodes => clearNodes(nodes));
          clearCache(value);
        })
      }, 500);
  }

  function clearNodes(nodes) {
    nodes.forEach(function (clas) {
      if (clas.path)
        clas.path.forEach(path => {
          getValue(path);
          var cache = global.$cache;
          cache.forEach(nodes => nodes.remove(clas))
        })
      if (clas.childNodes[0])
        clearNodes(clas.childNodes);
    });
  }

  function getValue(path) {
    return new Function('scope',
      `
      return scope${Path(path)};
      `
    )(app.model);
  }

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

function deepen(childNodes) {
  childNodes.forEach((nodes, we) => {
    nodes.forEach(node => {
      resolver[node.resolver](node, we);
    })
  });
}

window.View = View;
window.Router = Router;
window.clone = clone;