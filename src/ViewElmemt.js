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
  on: function (type, handler) {
    if (this.addEventListener) {
      this.addEventListener(type, handler, false);
    } else if (this.attachEvent) {
      this.attachEvent('on' + type, handler)
    } else {
      element['on' + type] + handler;
    }
    return this;
  },
  off: function (type, handler) {
    if (this.addEventListener) {
      this.removeEventListener(type, handler, false);
    } else if (this.detachEvent) {
      this.detachEvent('on' + type, handler)
    } else {
      element['on' + type] = null;
    }
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
  after(node) {
    if (this.nextSibling)
      this.parentNode.insertBefore(node, this.nextSibling);
    else
      this.parentNode.appendChild(node);
  }
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