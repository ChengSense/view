import { toChars } from "./ViewLang";
import { ReactCode } from "./ViewScope"
import { $lang, $when } from "./ViewExpress"
import { TagNode, TextNode, FuncNode } from "./ViewResolver"

export function AST(html) {
  let list = [];
  let open = "<", quote = "\"", close = ">";
  let chem = null, node = null, token = null;
  let chars = toChars(html);
  chars.reduce((a, b) => {
    if (a == open) {
      let c = b;
      token = close;
      node = new TagNode();
      return c;
    }
    else if (token == quote && b == quote) {
      let c = a.concat(b);
      node.setName(c.trim());
      token = close;
      return "";
    }
    else if (token == close && b == close) {
      let c = a;
      token = null;
      node.setName(c);
      list.push(node);
      node = new TextNode();
      return "";
    }
    else if (b == quote) {
      let c = a.concat(b);
      token = quote;
      return c;
    }
    else if (b == open) {
      node.setName(a)
      list.push(node);
      return b;
    }
    else if (node.type == "TAG" && !node.name && b == " ") {
      node.setName(a);
      return "";
    }
    else if (node.type == "TEXT" && (chem = a.match($lang))) {
      new FuncNode(list, chem[0], a);
      return b;
    }
    else {
      let c = a.concat(b);
      return c;
    }
  });
  return list;
}

export function Transfer(html) {
  let list = AST(html).
    filter(a => a.name.trim() != "");

  let express = list.
    map(a => a.react()).
    join().trim();

  let func = ReactCode(express).
    replace($when, ".when").
    trim();

  return func;
}