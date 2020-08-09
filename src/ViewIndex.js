import { Transfer } from "./ViewCompiler";
import { RenderCode } from "./ViewScope";
import { Render, React } from "./ViewResolver";
import { observer } from "./ViewObserve";
import { query } from "./ViewElmemt";

export let global = { $path: null, cache: new Map() };
export { Render, React, query }

export class View {
  constructor(app) {
    this.view = app.view;
    this.model = observer(app.model, watcher, this);
    this.action = app.action;
    this.watch = app.watch;
    this.filter = app.filter;
    this.creater(app);
  }
  creater(app) {
    this.view = Transfer(this.view);
    console.warn(this.view);
    this.node = RenderCode(this.view, this)(this.model);
  }
}

let watcher = {
  set(cache, we) {
    cache.forEach((param, func) => {
      let funcNodes = func(param.scope);
      let element = param.child[0];
      if (!element) return;
      funcNodes = Array.isArray(funcNodes) ? funcNodes : [funcNodes];
      funcNodes.forEach(funcNode => {
        let child = funcNode(param.scope);
        child instanceof Render ? child.value.forEach(a => a.forEach(c => element.appendChild(c))) : element.appendChild(child)
        element.parentNode.appendChild(child);
      })
      param.child.forEach(a => a.parentNode.removeChild(a));
    });
  },
  get(path) {

  }
};

window.View = View;