import { Transfer } from "./ViewCompiler";
import { RenderCode } from "./ViewScope";
import { Render, React } from "./ViewResolver";
import { observer } from "./ViewObserve";
import { query } from "./ViewElmemt";

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
    this.node = RenderCode(this.view, this.model);
  }
}

let watcher = {
  set(cache, we) {
    let view = RenderCode(we.view, we.model);
    document.querySelector("app").innerHTML = view;
  },
  get(path) {

  }
};

window.View = View;