import { observe } from "./ViewObserve";
import { query } from "./ViewElmemt";
import { init, initCompiler } from "./ViewInit";
import { slice, clone } from "./ViewLang";
import { resolver } from "./ViewResolver";
import { Router } from "./ViewRouter";
import { Path } from "./ViewScope";

export let global = { $path: undefined };

export class View {
  constructor(app) {
    this.content = { childNodes: [], children: [] };
    this.model = app.model;
    this.action = app.action;

    observe(app.model, function set(oldValue, cache) {
      clearCache(oldValue, app.model);
      deepen(cache, app.model);
    }, function get(path) {
      global.$path = path;
    });

    if (app.view) {
      this.view(app)
    }
    else if (app.component) {
      this.component(app)
    }

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

function clearCache(object, scope) {
  if (typeof object == "object" && !(object instanceof View))
    Object.keys(object).forEach(prop => {
      var value = object[prop];
      var cache = global.$cache;
      var path = global.$path;
      clearCache(value, scope);
      cache.forEach(nodes => clearNodes(nodes, scope));
      if (getValue(path, scope) == undefined) deepen(cache);
    })
}

function clearNodes(nodes, scope) {
  nodes.forEach(function (clas) {
    if (clas.path)
      clas.path.forEach(path => {
        if (getValue(path, scope) == undefined) return;
        var cache = global.$cache;
        cache.forEach(nodes => nodes.remove(clas));
      })
    if (clas.childNodes[0])
      clearNodes(clas.childNodes, scope);
  });
}

function getValue(path, scope) {
  try {
    global.$cache = undefined;
    return new Function('scope',
      `
      return scope${Path(path)};
      `
    )(scope);
  } catch (error) {
    return undefined;
  }
}

function deepen(cache, scope) {
  cache.forEach((nodes, we) => {
    clearNodes(nodes, scope);
    nodes.forEach(node => {
      resolver[node.resolver](node, we);
    })
  });
}

window.View = View;
window.Router = Router;
window.clone = clone;