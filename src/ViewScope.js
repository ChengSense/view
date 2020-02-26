import { Render, React } from "./ViewResolver";

export function ReactCode(express) {
  return new Function('React',
    `return ${express};`
  )(React);
}

export function RenderCode(express, scope) {
  let keys = Object.keys(scope);
  return new Function('scope', 'React', 'Render',
    `let {${keys}}=scope;
     return ${express};
    `
  )(scope, React, Render);
}