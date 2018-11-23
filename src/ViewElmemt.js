import { each, extend,extention, slice } from "./ViewLang";
import { code } from "./ViewScope";

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

function listener(type, methds, scope) {
  if (this.addEventListener) {
    this.addEventListener(type, function (event) {
      methds.forEach(methd => {
        var args = methd.$params ? code(`[${methd.$params}]`, scope) : [];
        args.push(event);
        methd.apply(extention({
          $view: methd.$view,
          $action: methd.$action
        }, methd.$model), args);
      });
    }, false);
  } 
  else if (this.attachEvent) {
    this.attachEvent('on' + type, function (event) {
      methds.forEach(methd => {
        var args = methd.$params ? code(`[${methd.$params}]`, scope) : [];
        args.push(_event);
        methd.apply(extention({
          $view: methd.$view,
          $action: methd.$action
        }, methd.$model), args);
      });
    });
  } 
  else {
    element['on' + type] = function (event) {
      methds.forEach(methd => {
        var args = methd.$params ? code(`[${methd.$params}]`, scope) : [];
        args.push(event);
        methd.apply(extention({
          $view: methd.$view,
          $action: methd.$action
        }, methd.$model), args);
      });
    };
  }
}

extend(Node, {
  on: function (type, handler, scope) {
    if (this._manager) {
      if (this._manager.get(type)) {
        this._manager.get(type).ones(handler);
      }
      else {
        let methds = [handler];
        this._manager.set(type, methds);
        listener.call(this, type, methds, scope);
      }
    }
    else {
      let methds = [handler];
      this._manager = new Map().set(type, methds);
      listener.call(this, type, methds, scope);
    }
    return this;
  },
  off: function (type, handler) {
    if (this._manager) {
      if (this._manager.get(type)) {
        this._manager.get(type).remove(handler);
      }
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
    return this;
  },
  off(type, call) {
    each(this, function (node) {
      node.off(type, call);
    });
    return this;
  }
});