import { each, extend, extention, slice } from "./ViewLang";
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

function addListener(type, methds, scope) {
  if (this.addEventListener) {
    this.addEventListener(type, function (event) {
      methds.forEach((params, methd) => {
        params.forEach(param => {
          var args = param ? code(`[${param}]`, scope) : [];
          args.push(event);
          methd.apply(extention({
            $view: methd.$view,
            $action: methd.$action
          }, methd.$model), args);
        })
      });
    }, false);
  }
  else if (this.attachEvent) {
    this.attachEvent('on' + type, function (event) {
      methds.forEach((params, methd) => {
        params.forEach(param => {
          var args = param ? code(`[${param}]`, scope) : [];
          args.push(event);
          methd.apply(extention({
            $view: methd.$view,
            $action: methd.$action
          }, methd.$model), args);
        })
      });
    });
  }
  else {
    element['on' + type] = function (event) {
      methds.forEach((params, methd) => {
        params.forEach(param => {
          var args = param ? code(`[${param}]`, scope) : [];
          args.push(event);
          methd.apply(extention({
            $view: methd.$view,
            $action: methd.$action
          }, methd.$model), args);
        })
      });
    };
  }
}

function removeListener(type, handler) {
  if (this.addEventListener) {
    this.removeEventListener(type, handler, false);
  }
  else if (this.detachEvent) {
    this.detachEvent('on' + type, handler);
  }
  else {
    element['on' + type] = null;
  }
}

extend(Node, {
  on: function (type, handler, scope, params) {
    if (this._manager) {
      if (this._manager.get(type)) {
        let methds = this._manager.get(type);
        if (methds.get(handler)) {
          methds.get(handler).ones(params);
        }
        else {
          methds.set(handler, [params]);
        }
      }
      else {
        let methds = new Map();
        methds.set(handler, [params]);
        this._manager.set(type, methds);
        addListener.call(this, type, methds, scope);
      }
    }
    else {
      let methds = new Map();
      methds.set(handler, [params]);
      this._manager = new Map();
      this._manager.set(type, methds);
      addListener.call(this, type, methds, scope);
    }
    return this;
  },
  off: function (type, handler) {
    if (this._manager) {
      let methds = this._manager.get(type);
      if (methds == undefined) return;
      methds.delete(handler);
      if (methds.size) return;
      this._manager.delete(type);
      removeListener.call(this, type, handler);
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
