import { each, extend, slice } from "./ViewLang";

export function query(express) {
  try {
    var doc = document.querySelectorAll(express);
    return doc;
  } catch (e) {
    var newNode = document.createElement("div");
    newNode.innerHTML = express.trim();
    return newNode.childNodes;
  }
}

extend(Node, {
  on(type, methd) {
    this.addEventListener(type, methd);
    return this;
  },
  reappend(node) {
    each(slice(this.childNodes), function (child) {
      child.parentNode.removeChild(child);
    });
    this.appendChild(node);
    return this;
  },
  before(node) {
    this.parentNode.insertBefore(node, this);
  },
});

extend(NodeList, {
  on(type, call) {
    each(this, function (node) {
      node.on(type, call);
    });
  },
  off(type, call) {
    each(this, function (node) {
      node.off(type, call);
    });
  }
});