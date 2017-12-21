import { each, extend, slice } from "./ViewLang";

export function query(express) {

	try {

		var doc = document.querySelectorAll(express);

		if (!doc[0])

			throw new Error();

		return doc;

	} catch (e) {

		var newNode = document.createElement("div");

		newNode.innerHTML = express;

		return newNode.childNodes;

	}
	
}

window.query = query;

extend(Node, {
	on: function (type, select, methd, bol) {
		var manager = this["@Manager"] = this["@Manager"] || {};
		var methds = manager[type] = manager[type] || [];
		methds.push(methd ? { select: select, methd: methd } : select);
		if (manager["@" + type]) return this;
		this.addEventListener(type, manager["@" + type] = function (event) {
			var node = event.target;
			methds.forEach(function (methd) {
				switch (typeof methd) {
					case "object":
						if (node.parentNode)
							each(node.parentNode.querySelectorAll(methd.select), function (child) {
								if (child.isSameNode(node))
									methd.methd.call(child, event);
							})
						break;
					default:
						methd.call(node, event);
						break;
				}
			})
		}, bol);
		return this;
	},
	off: function (type, call) {
		var manager = this["@Manager"];
		switch (typeof call) {
			case "function":
				manager[type].remove(call);
				break;
			case "undefined":
				manager[type].clear();
				break;
			case "string":
				manager[type].forEach(function (methd) {
					methd = typeof (methd) == "object" ? methd.methd : methd;
					if (methd.prototype.constructor.name == call)
						manager[type].remove(methd);
				});
				break;
		}
		if (!manager[type].length) {
			this.removeEventListener(type, manager["@" + type], false);
			delete manager["@" + type];
			delete manager[type];
		}
		return this;
	},
	clone: function () {
		switch (this.nodeType) {
			case 1:
				if (undefined != window.jQuery)
					return jQuery(this).clone(true)[0];
			default:
				var node = this.cloneNode(true);
				node["@Manager"] = this["@Manager"]
				each(node["@Manager"], function (handler, key) {
					if (key.match("@"))
						node.addEventListener(type, handler, false);
				});
				return node;
		}
	},
	after: function (node) {
		switch (this.nextSibling) {
			case undefined:
				this.parentNode.appendChild(node);
				break;
			default:
				this.parentNode.insertBefore(node, this.nextSibling);
				break;
		}
	},
	clear: function (node) {
		each(this.childNodes, function (child) {
			child.parentNode.removeChild(child);
		})
		this.appendChild(node);
		return this;
	},
});
extend(NodeList, {
	on: function (type, select, call, bol) {
		each(this, function (node) {
			node.on(type, select, call, bol);
		});
	},
	off: function (type, call, bol) {
		each(this, function (node) {
			node.off(type, call, bol);
		});
	},
	append: function (node) {
		switch (typeof node) {
			case "string":
				var newNode = document.createDocumentFragment();
				newNode.innerHTML = node;
				each(newNode.childNodes, this[0], function (node, i, thiz) {
					thiz.appendChild(node);
				});
				break;
			default:
				switch (node.length) {
					case undefined:
						this[0].appendChild(node);
						break;
					default:
						each(node, this[0], function (node, i, thiz) {
							thiz.appendChild(node);
						});
						break;
				}
				break;
		}
	},
	after: function (node) {
		switch (typeof node) {
			case "string":
				var newNode = document.createDocumentFragment();
				newNode.innerHTML = node;
				each(newNode.childNodes, this[0], function (node, i, thiz) {
					thiz.parentNode.insertBefore(this, thiz.nextSibling);
				});
				break;
			default:
				switch (node.length) {
					case undefined:
						this[0].parentNode.insertBefore(node, this[0].nextSibling);
						break;
					default:
						each(node, this[0], function (node, i, thiz) {
							thiz.parentNode.insertBefore(node, thiz.nextSibling);
						});
						break;
				}
				break;
		}
	},
	before: function (node) {
		switch (typeof node) {
			case "string":
				var newNode = document.createDocumentFragment();
				newNode.innerHTML = node;
				each(newNode.childNodes, this[0], function (node, i, thiz) {
					thiz.parentNode.insertBefore(this, thiz);
				});
				break;
			default:
				switch (node.length) {
					case undefined:
						this[0].parentNode.insertBefore(node, this[0]);
						break;
					default:
						each(node, this[0], function (node, i, thiz) {
							thiz.parentNode.insertBefore(node, thiz);
						});
						break;
				}
				break;
		}
	},
	replace: function (node) {
		switch (typeof node) {
			case "string":
				var newNode = document.createDocumentFragment();
				newNode.innerHTML = node;
				each(newNode.childNodes, this[0], function (node, i, thiz) {
					thiz.parentNode.replaceChild(this, thiz);
				});
				break;
			default:
				switch (node.length) {
					case undefined:
						this[0].parentNode.replaceChild(node, this[0]);
						break;
					default:
						each(node, this[0], function (node, i, thiz) {
							thiz.parentNode.replaceChild(node, thiz);
						});
						break;
				}
				break;
		}
	},
	clone: function (bol) {
		return this[0].cloneNode(bol || true);
	}
});
