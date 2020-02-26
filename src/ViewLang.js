import { $express } from "./ViewExpress"

export function toChars(html) {
  return html.split("");
}

export function selfClose(name) {
  let node = document.createElement(name);
  return !new RegExp(/<\/\w+>/).test(node.outerHTML);
}

export function attrCreater(object) {
  let list = [];
  Object.keys(object).forEach(i => {
    let value = object[i];
    list.push(`${i}="${value}"`);
  });
  return list.join(" ");
}

export function attrRender(object) {
  let list = [];
  Object.keys(object).forEach(i => {
    let value = object[i];
    let express = `\`${value.replace($express, "${$1}")}\``;
    list.push(`"${i}":${express}`);
  });
  return `{${list}}`;
}

export function forEach(list, method) {
  list.every((value, i) =>
    !method(value, i)
  )
}