
import { whiles } from "./ViewLang";
import { createNode } from "./ViewElmemt";
import { $chen, $lang, $whea, $whec, $eash, $id, $event, $close, $html } from "./ViewExpress";

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
    let item = { clas: createNode(child), children: [], action: new Map() };
    children.push(item);
    if (new RegExp($html).test(child)) {
      if (new RegExp($close).test(item.clas.outerHTML)) {
        initCompiler(list, item.children);
      }
      child = child.replace($eash, (express) => {
        express = express.replace($eash, "@each($3){");
        let index = children.indexOf(item);
        let each = { clas: createNode(express), children: [item] };
        children.splice(index, 1, each);
        item.clas.removeAttribute("@each");
        return "";
      });
      child = child.replace($id, (express) => {
        let name = express.replace($id, "$1");
        let value = express.replace($id, "$3");
        Reflect.set(item, name, value);
        item.clas.removeAttribute("@id");
        return "";
      });
      child = child.replace($event, (express) => {
        let name = express.replace($event, "$1");
        let value = express.replace($event, "$3");
        item.action.set(name, value);
        item.clas.removeAttribute(name);
        return "";
      });
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