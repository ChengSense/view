import { Render, React } from "./ViewResolver";

export function ReactCode(express) {
  return new Function('React',
    `return ${express};`
  )(React);
}

export function RenderCode(express, we) {
  let keys = Object.keys(we.model);
  window.we = we;
  return new Function('we', 'React', 'Render',
    `let {${keys}}=we.model;
     return ${express};
    `
  )(we, React, Render);
}