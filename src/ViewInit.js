
import { whiles } from "./ViewLang";
import { createNode } from "./ViewElmemt";
import { $chen, $lang, $whea, $whec, $eash, $close, $html } from "./ViewExpress";

export function init(dom) {
  let text = dom.outerHTML
  text = text.replace($lang, tag => "######".concat(tag.trim(), "######"));
  let list = text.split("######");
  return list;
}

export function initCompiler(list, children) {
  whiles(list, child => {
    if (child.trim() == "") return;
    if (new RegExp($close).test(child)) return true;
    let item = { clas: createNode(child), children: [] };
    children.push(item);
    if (new RegExp($html).test(child)) {
      if (new RegExp($close).test(item.clas.outerHTML)) {
        initCompiler(list, item.children);
      }
      if (new RegExp($eash).test(child)) {
        item.clas = createNode(child.replace($eash, child => {
          child = child.replace($eash, "@each($2){");
          let index = children.indexOf(item);
          let each = { clas: createNode(child), children: [item] };
          children.splice(index, 1, each);
          return "";
        }));
      }
    }
    else if (new RegExp($chen).test(child)) {
      initCompiler(list, item.children);
      if (new RegExp($whea).test(child)) {
        let index = children.indexOf(item);
        let when = { clas: createNode("@when{"), children: [item] };
        children.splice(index, 1, when);
      } else if (new RegExp($whec).test(child)) {
        let when = children[children.length - 2];
        when.children.push(children.pop());
      }
    }
  });
  return children;
}