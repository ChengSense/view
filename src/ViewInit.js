
import { whiles } from "./ViewLang";
import { createNode } from "./ViewElmemt";
import { $chen, $lang, $whea, $whec, $eash, $close } from "./ViewExpress";

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
    let item = { clas: createNode(child), children: [], childNodes: [] };
    children.push(item);
    if (new RegExp($chen).test(child)) {
      initCompiler(list, item.children);
      if (new RegExp($eash).test(child)) {
        item.clas = createNode(child.replace($eash, child => {
          child = child.replace($eash, "@each($2){");
          let index = children.indexOf(item);
          let each = { clas: createNode(child), children: [item], childNodes: [] };
          children.splice(index, 1, each);
          return "";
        }));
      }
      else if (new RegExp($whea).test(child)) {
        let index = children.indexOf(item);
        let when = { clas: createNode("@when{"), children: [item], childNodes: [] };
        children.splice(index, 1, when);
      } else if (new RegExp($whec).test(child)) {
        let when = children[children.length - 2];
        when.children.push(children.pop());
      }
    }
  });
  return children;
}