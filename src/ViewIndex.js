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
    let func = RenderCode(this.view, this);
    this.node = RenderCode(this.view, this)(this.model, func);
  }
}

let watcher = {
  set(cache, newCache, we) {
    cache.forEach(caches => {
      caches.forEach((param, func) => {
        let childNodes = param.child; param.child = [];
        let element = childNodes[0];
        let funcNodes = func(param.scope, func);
        if (!element) return;
        funcNodes = Array.isArray(funcNodes) ? funcNodes : [funcNodes];
        funcNodes.forEach(funcNode => {
          //let child = funcNode(param.scope, funcNode);
          if (funcNode instanceof Render) {
            funcNode.value.forEach(a => a.forEach(c => {
              param.child.push(c);
              element.before(c);
            }))
          } else {
            param.child.push(funcNode);
            element.before(funcNode);
          }
        })
        childNodes.forEach(a => a.parentNode.removeChild(a));
      });
    });
  },
  get(path) {

  }
};

window.View = View;