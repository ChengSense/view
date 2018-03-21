
import { each, slice } from "./ViewLang";
import { $chen, $lang, $close } from "./ViewExpress";

export function init(dom) {
  each(dom, function (node) {
    if (node.childNodes[0] && node.nodeName != "SCRIPT")
      init(slice(node.childNodes));
    if (node.nodeType == 3)
      node.nodeValue.replace($lang, function (tag) {
        var nodes = node.nodeValue.split(tag);
        node.parentNode.insertBefore(document.createTextNode(nodes[0]), node);
        node.parentNode.insertBefore(document.createTextNode(tag.trim()), node);
        node.nodeValue = node.nodeValue.replace(nodes[0], "").replace(tag, "");
      });
  });
  return dom;
}

export function initCompiler(node, children) {
  return each(node, children || [], function (child, i, list) {
    node.shift();
    if (new RegExp($close).test(child.nodeValue)) return true;
    var item = { clas: child.cloneNode(true), children: [] };
    if (!(child.nodeType == 3 && child.nodeValue.trim() == ""))
      list.push(item);
    switch (child.nodeType) {
      case 1:
        initCompiler(slice(child.childNodes), item.children);
        break;
      default:
        child.nodeValue.replace($chen, function () {
          initCompiler(node, item.children);
        });
        break;
    };
  });
}