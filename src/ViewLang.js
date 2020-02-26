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
  forEach(object, (value, name) => {
    list.push(`${name}="${value}"`);
  });
  return list.join(" ");
}

export function attrRender(object) {
  let list = [];
  forEach(object, (value, name) => {
    let express = `\`${value.replace($express, "${$1}")}\``;
    list.push(`"${name}":${express}`);
  });
  return `{${list}}`;
}

export function forEach(object, method) {
  Object.keys(object).forEach(key => {
    let value = Reflect.get(object, key);
    method(value, key)
  });
}