(function () {
	var $express = /\{\s*\{([^\{\}]*)\}\s*\}/g;
	var $express1 = /\{\s*\{([^\{\}]*)\}\s*\}/;
	var $each = /(@each)\s*\((.*)\s*,\s*\{/g;
	var $when = /(@when)\s*\((.*)\s*,\s*\{/g;
	var $else = /(@else)/g;
	var $chen = /(@each|@when)\s*\((.*)\s*,\s*\{/g;
	var $lang = /((@each|@when)\s*\((.*)\s*,\s*\{|\{\s*\{([^\{\}]*)\}\s*\}|\s*\}\s*\)|@else)/g;
	var $close = /\}\s*\)\s*/g;
	var $break = /\}\s*\)|(@else)/g;
	var $word = /(\w+)((\.\w+)|(\[(.+)\]))*/g;
	var $word1 = /\w+/g;
	function view(app) {
		var cache = {}, $path;
		var resolver = {
			init: function (apply, scope) {
				try {
					apply = query(apply);
					app.view = apply[0];
					var node = blankOut(initCompiler(init(slice(apply))))[0];
					var doc = document.createDocumentFragment();
					compiler(doc, scope, slice(node.children), { childNodes: [], childNode: [] });
					console.log(cache);
					app.view.clear(doc);
					if (app.controller) app.controller(app.model);
				} catch (e) {
					console.log(e);
				}
			},
			express: function (node, scope) {
				try {
					node.node.nodeValue = code(node.clasNode.nodeValue, scope);
					if (node.node.name == "value")
						node.node.ownerElement.value = node.node.nodeValue;
				} catch (e) {
					console.log(e);
				}
			},
			attribute: function (node, scope) {
				try {
					var newNode = document.createAttribute(code(node.clasNode.name, scope));
					newNode.nodeValue = node.clasNode.nodeValue;
					node.node.ownerElement.setAttributeNode(newNode);
					node.node.ownerElement.removeAttributeNode(node.node);
					var children = codes(node.path, cache);
					var childNodes = children.get(node.clasNode);
					childNodes.clear();
					setComCache(newNode, scope, node.clasNode);
				} catch (e) {
					console.log(e);
				}
			},
			each: function (node, scope, childNodes, path) {
				try {
					var insert = insertion([node]);
					var comment = document.createComment("");
					insert.parentNode.replaceChild(comment, insert);
					childNodes.remove(node);
					clearEachNode([node], node);
					var doc = document.createDocumentFragment();
					compiler(doc, scope, [node], { childNodes: [], childNode: [] });
					comment.parentNode.replaceChild(doc, comment);
					console.log(cache);
				} catch (e) {
					console.log(e);
				}
			},
			when: function (node, scope, childNodes, path) {
				try {
					var insert = insertion([node]);
					var comment = document.createComment("");
					insert.parentNode.replaceChild(comment, insert);
					clearWhenNode([node], node);
					var doc = document.createDocumentFragment();
					compiler(doc, scope, [node], { childNodes: [], childNode: [] });
					comment.parentNode.replaceChild(doc, comment);
					var children = codes(node.path, cache);
					var nodes = children.get(node.clasNode);
					node.content.childNodes.remove(node).push(nodes.last());
					console.log(cache);
				} catch (e) {
					console.log(e);
				}
			}
		};
		function clearEachNode(nodes) {
			nodes.forEach(function (node) {
				clearChenNode([node]);
				if (node.path) {
					var children = codes(node.path, cache);
					var childNodes = children.get(node.clasNode);
					if (childNodes) {
						clearChenNode(childNodes);
						children.delete(node.clasNode);
						childNodes.clear();
						if (children.size == 0)
							eval("delete cache" + patha(node.path));
					}
				}
				if (node.childNodes)
					clearEachNode(node.childNodes);
			});
			return nodes;
		}
		function clearWhenNode(nodes, node) {
			nodes.forEach(function (node) {
				clearChenNode([node]);
				if (node.path) {
					var children = codes(node.path, cache);
					var childNodes = children.get(node.clasNode);
					childNodes.remove(node);
					if (childNodes && !node) {
						clearChenNode(childNodes);
						children.delete(node.clasNode);
						childNodes.clear();
						if (children.size == 0)
							eval("delete cache" + patha(node.path));
					}
				}
				if (node.childNodes)
					clearWhenNode(node.childNodes);
			});
			return nodes;
		}
		function clearChenNode(nodes) {
			nodes.forEach(function (child) {
				if (child.node && child.node.parentNode)
					child.node.parentNode.removeChild(child.node);
				if (child.childNodes)
					clearChenNode(child.childNodes);
			});
		}
		function insertion(nodes, node) {
			nodes.forEach(function (child) {
				if (child.node && child.node.parentNode)
					return node = child.node;
				return node = insertion(child.childNodes);
			});
			return node;
		}
		function code(_express, _scope) {
			try {
				with (_scope) {
					_express = _express.replace($word1, function (express) {
						var value = _scope[express];
						if (typeof (value) == 'string') {
							if (/@path:/.test(value))
								return path(value);
							if (/@index/.test(value))
								return index(value);
						}
						return express;
					});
					if (new RegExp($express).test(_express))
						_express = "'" + _express.replace($express, "'+($1)+'") + "'";
					$path = undefined;
					return eval(_express);
				}
			} catch (e) {
				return undefined;
			}
		}
		function path(_express) {
			try {
				return _express.replace("@path:", "").replace(/\.(\w+)?/g, "['$1']");
			} catch (err) {
				console.log(err)
			}
		}
		function index(_express) {
			try {
				return "'" + _express.replace("@index:", "") + "'";;
			} catch (err) {
				console.log(err)
			}
		}
		function codes(_express, _scope) {
			try {
				return _scope["@" + _express] = _scope["@" + _express] || new Map();
			} catch (e) {
				return undefined;
			}
		}
		function patha(_express) {
			try {
				return "['@" + _express + "']";
			} catch (err) {
				console.log(err)
			}
		}
		function init(dom) {
			each(dom, function (node) {
				if (node.childNodes[0] && node.nodeName != "SCRIPT")
					init(slice(node.childNodes));
				if (node.nodeType == 3)
					node.nodeValue.replace($lang, function (tag) {
						var nodes = node.nodeValue.split(tag);
						node.parentNode.insertBefore(document.createTextNode(nodes[0]), node);
						node.parentNode.insertBefore(document.createTextNode(tag), node);
						node.nodeValue = node.nodeValue.replace(nodes[0], "").replace(tag, "");
					});
			});
			return dom;
		}
		function blankOut(dom) {
			each(dom, function (child) {
				if (child.children[0] && child.node.nodeName != "SCRIPT")
					blankOut(child.children);
				if (child.node.nodeValue && child.node.nodeValue.trim() == "" || child.node.nodeValue == "")
					dom.remove(child);
			});
			return dom;
		}
		function setCache(node, scope, clasNode, content, inode) {
			if (!clasNode.clasNode) return;
			switch (clasNode.clasNode.nodeType) {
				case 1:
					var key = clasNode.clasNode.getAttribute("each").split(":").pop();
					if (code(key, scope) == undefined || $path == undefined) return;
					var caches = codes($path, cache);
					clasNode.resolver = "each";
					clasNode.content = content;
					clasNode.scope = scope;
					clasNode.path = $path;
					clasNode.node = node;
					caches.setting(clasNode, inode);
					return;
				default:
					if (clasNode.clasNode.nodeValue)
						clasNode.clasNode.nodeValue.replace($each, function (key) {
							key = key.replace($each, "$2").split(":").pop();
							if (code(key, scope) == undefined || $path == undefined) return;
							var caches = codes($path, cache);
							clasNode.resolver = "each";
							clasNode.content = content;
							clasNode.scope = scope;
							clasNode.path = $path;
							clasNode.node = node;
							caches.setting(clasNode, inode);
						});
					if (clasNode.clasNode.nodeValue)
						clasNode.clasNode.nodeValue.replace($when, function (key) {
							key = key.replace($when, "$2");
							key.replace($word, function (key) {
								if (code(key, scope) == undefined || $path == undefined) return;
								var caches = codes($path, cache);
								clasNode.resolver = "when";
								clasNode.content = content;
								clasNode.scope = scope;
								clasNode.path = $path;
								clasNode.node = node;
								caches.setting(clasNode, inode);
							});
						});
					break;
			}
		}
		function setComCache(node, scope, clasNode) {
			if (node.name == "value")
				binding(node, scope);
			switch (clasNode.clasNode != undefined) {
				case true:
					if (node.nodeValue)
						node.nodeValue.replace($express, function (key) {
							key.replace($word, function (key) {
								if (code(key, scope) == undefined || $path == undefined) return;
								var caches = codes($path, cache);
								clasNode.resolver = "express";
								clasNode.scope = scope;
								clasNode.path = $path;
								clasNode.node = node;
								caches.setting(clasNode);
							});
						});
					break;
				default:
					if (clasNode.name)
						clasNode.name.replace($express, function (key) {
							if (code(key, scope) == undefined || $path == undefined) return;
							var caches = codes($path, cache);
							caches.setting({
								resolver: "attribute",
								clasNode: clasNode,
								scope: scope,
								path: $path,
								node: node
							});
						});
					if (node.nodeValue)
						node.nodeValue.replace($express, function (key) {
							key.replace($word, function (key) {
								if (code(key, scope) == undefined || $path == undefined) return;
								var caches = codes($path, cache);
								caches.setting({
									resolver: "express",
									clasNode: clasNode,
									scope: scope,
									path: $path,
									node: node
								});
							});
						});
					break;
			}
		}
		function initCompiler(node, children) {
			return each(node, children || [], function (child, i, list) {
				node.shift();
				if (new RegExp($close).test(child.nodeValue))
					return true;
				var item = { node: child, children: [] };
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
		function commom(node, scope, clasNode) {
			each(node.attributes, function (child) {
				if (new RegExp($express1).test(child.name)) {
					try {
						var node = document.createAttribute(code(child.name, scope));
						node.nodeValue = child.nodeValue;
						child.ownerElement.setAttributeNode(node);
						child.ownerElement.removeAttributeNode(child);
						setComCache(node, scope, (clasNode.clasNode || clasNode).getAttributeNode(child.name));
						commom(node, scope, (clasNode.clasNode || clasNode).getAttributeNode(child.name));
					} catch (e) {
						console.log(child.name + "属性节点不允许为null或者''， " + child.name + "=" + child.nodeValue + "属性节点创建失败");
					}
				}
				commom(child, scope, (clasNode.clasNode || clasNode).getAttributeNode(child.name));
			});
			if (new RegExp($express1).test(node.nodeValue)) {
				setComCache(node, scope, clasNode);
				node.nodeValue = code(node.nodeValue, scope);
			}
		}
		function classNode(newNode, child) {
			return {
				node: newNode,
				clasNode: child.node,
				children: child.children,
				scope: child.scope,
				childNodes: []
			};
		}
		function setting(child, scope) {
			if (!child.clasNode)
				return child;
			return {
				node: (child.clasNode || child.node),
				scope: scope,
				clasNode: child.clasNode,
				children: child.children,
				childNodes: []
			};
		}
		function compiler(node, iscope, childNodes, content) {
			each(childNodes, function (child, index, childNodes) {
				child = setting(child, iscope);
				if (new RegExp($break).test(child.node.nodeValue))
					return childNodes.clear();
				switch (child.node.nodeType) {
					case 1:
						if (child.node.hasAttribute("each")) {
							var expreses = child.node.getAttribute("each").split(":");
							child.node.variable = expreses.shift().trim(), child.node.dataSource = expreses.pop().trim();
							var dataSource = code(child.node.dataSource, iscope) || [];

							node.appendChild(document.createComment($path));
							var clasNode = classNode(null, child);
							content.childNodes.push(clasNode);
							setCache(null, iscope, clasNode, content, node);

							each(dataSource, function (item, index) {
								var scope = Object.create(iscope || {});
								scope[child.node.variable] = "@path:" + $path;
								if (expreses[0]) scope[expreses[0].trim()] = "@index:" + index;
								var newNode = child.node.cloneNode();
								newNode.removeAttribute("each");
								node.appendChild(newNode);
								var clasNodes = classNode(newNode, child);
								clasNode.childNodes.push(clasNodes);
								compiler(newNode, scope, slice(child.children), clasNodes);
								commom(newNode, scope, child.node);
							});
						} else {
							var newNode = child.node.cloneNode();
							node.appendChild(newNode);
							var clasNodes = classNode(newNode, child);
							content.childNodes.push(clasNodes);
							compiler(newNode, iscope, slice(child.children), clasNodes);
							commom(newNode, iscope, clasNodes);
						}
						break;
					default:
						if (new RegExp($each).test(child.node.nodeValue)) {
							var expreses = child.node.nodeValue.replace($each, "$2").split(":");
							child.node.variable = expreses.shift().trim(), child.node.dataSource = expreses.pop().trim();
							var dataSource = code(child.node.dataSource, iscope) || [];

							node.appendChild(document.createComment($path));
							var clasNode = classNode(null, child);
							content.childNodes.push(clasNode);
							setCache(null, iscope, clasNode, content, node);

							each(dataSource, slice(child.children), function (item, index, children) {
								var scope = Object.create(iscope || {});
								scope[child.node.variable] = "@path:" + $path;
								if (expreses[0]) scope[expreses[0].trim()] = "@index:" + index;
								var clasNodes = classNode(null, child);
								clasNode.childNodes.push(clasNodes);
								compiler(node, scope, slice(children), clasNodes);
							});
						} else if (new RegExp($when).test(child.node.nodeValue)) {
							var clasNode = classNode(null, child);
							content.childNodes.push(clasNode);
							setCache(null, iscope, clasNode, content, node);
							var when = code(child.node.nodeValue.replace($when, "$2"), iscope);
							if (when) {
								each(slice(child.children), function (child, index, childNodes) {
									if (new RegExp($break).test(child.node.nodeValue))
										return true;
									switch (child.node.nodeType == 1 || new RegExp($chen).test(child.node.nodeValue)) {
										case true:
											compiler(node, iscope, childNodes, clasNode);
											break;
										default:
											var newNode = child.node.cloneNode();
											node.appendChild(newNode);
											var clasNodes = classNode(newNode, child);
											clasNode.childNodes.push(clasNodes);
											commom(newNode, iscope, clasNodes);
											break;
									}
									childNodes.shift();
								});
							} else {
								each(slice(child.children), function (child, index, childNodes) {
									childNodes.shift();
									if (new RegExp($else).test(child.node.nodeValue)) {
										each(childNodes, function (child, index, childNodes) {
											switch (new RegExp($chen).test(child.node.nodeValue) || child.node.nodeType == 1) {
												case true:
													compiler(node, iscope, childNodes, clasNode);
													break;
												default:
													var newNode = child.node.cloneNode();
													node.appendChild(newNode);
													var clasNodes = classNode(newNode, child);
													clasNode.childNodes.push(clasNodes);
													commom(newNode, iscope, clasNodes);
													break;
											}
											childNodes.shift();
										});
									}
								});
							}
						} else {
							var newNode = child.node.cloneNode();
							node.appendChild(newNode);
							var clasNodes = classNode(newNode, child);
							content.childNodes.push(clasNodes);
							commom(newNode, iscope, clasNodes);
						}
						break;
				}
				childNodes.shift();
			});
		}
		function binding(node, scope) {
			var owner = node.ownerElement;
			owner._express = node.nodeValue.replace($express, "$1");
			owner.on("change", function handle() {
				code(owner._express + "='" + owner.value.replace(/(\'|\")/g, "\\$1") + "'", scope);
			});
		}
		observe(app.model, function callSet(name, path) {
			var nodes = cache["@" + path] || [];
			slice(nodes).forEach(function (childNodes, clasNode) {
				var node = childNodes[0];
				if (node && node.resolver == "each")
					return resolver[node.resolver](node, node.scope, childNodes, path);
				slice(childNodes).forEach(function (node) {
					resolver[node.resolver](node, node.scope, childNodes, path);
				});
			});
		}, function callGet(name, path) {
			$path = path;
		});
		resolver["init"](app.view, app.model);
		return app;
	}
	window.view = view;
})(window);
(function () {
	function query(express) {
		try {
			var doc = document.querySelectorAll(express);
			if (!doc[0])
				throw new Error();
			return doc;
		} catch (e) {
			var newNode = document.createDocumentFragment();
			newNode.innerHTML = express;
			return newNode.childNodes;
		}
	}
	function ready(func) {
		var done = false;
		var init = function () {
			if (done) {
				document.removeEventListener("DOMContentLoaded", init, false);
				window.removeEventListener("load", init, false);
				func();
				return;
			}
			if (document.readyState == "complete") {
				done = true;
				init();
			}
		};
		document.addEventListener("DOMContentLoaded", init, false);
		window.addEventListener("load", init, false);
		init();
	}
	function extend(object, src) {
		var prototype = object.prototype || object.__proto__;
		for (var key in src) {
			prototype[key] = src[key];
		}
		return object;
	}
	function each(obj, arg, callback) {
		if (!obj) return;
		var methd = arguments[2] || arguments[1];
		var args = arguments[2] ? arg : obj;
		if (obj.length != undefined) {
			var length = obj.length;
			for (var i = 0; i < length; i++) {
				if (obj.length != length)
					i-- , length = obj.length;
				if (obj.hasOwnProperty(i)) {
					var data = obj[i];
					if (methd.call(data, data, i, args))
						break;
				}
			}
		} else {
			for (var i in obj)
				if (obj.hasOwnProperty(i)) {
					var data = obj[i];
					if (methd.call(data, data, i, args))
						break;
				}
		}
		return args;
	}
	function slice(obj) {
		if (obj instanceof Map) {
			var map = new Map();
			obj.forEach(function (entity, key) {
				map.set(key, entity);
			});
			return map;
		}
		if (obj.length != undefined)
			return Array.prototype.slice.call(obj, 0);
		return each(obj, [], function (node, i, list) {
			list.push(this);
		});
	}
	extend(Array, {
		delete: function (index) {
			this.splice(index, 1);
			return this;
		},
		remove: function (n) {
			var index = this.indexOf(n);
			if (index > -1)
				this.splice(index, 1);
			return this;
		},
		replace: function (o, n) {
			var index = this.indexOf(o);
			if (index > -1)
				this.splice(index, 1, n);
		},
		clear: function (n) {
			this.splice(0, this.length);
			return this;
		},
		last: function () {
			return this[this.length - 1];
		}
	});
	extend(Map, {
		each: function (k, n) {
			var childNodes = this.get(k.clasNode);
			if (childNodes) {
				k.node = n.childNodes[0];
				childNodes.push(k);
			} else {
				k.node = n.childNodes[0];
				this.set(k.clasNode, [k]);
			}
		},
		chen: function (k, n) {
			var childNodes = this.get(k.clasNode);
			if (childNodes) {
				childNodes.push(k);
			} else {
				this.set(k.clasNode, [k])
			}
		},
		setting: function (k, v) {
			if (this[k.resolver]) {
				this.each(k, v);
			} else {
				this.chen(k, v);
			}
		}
	});
	extend(Node, {
		on: function (type, exp, methd, bol) {
			switch (methd) {
				case undefined:
					this.addEventListener(type, exp, bol);
					break;
				default:
					this.addEventListener(type, function (event) {
						var node = event.target;
						var nodes = (node.parentNode || node).querySelectorAll(exp);
						each(nodes, function (child) {
							if (child.isSameNode(node))
								methd.call(child, event);
						})
					}, bol);
					break;
			}
		},
		off: function (type, call) {
			if (!this.eventManager || !this.eventManager[type])
				return;
			var manager = this.eventManager[type];
			switch (typeof call) {
				case "undefined":
					manager.clear();
					break;
				case "function":
					manager.remove(call);
					break;
				case "string":
					manager.forEach(function (methd) {
						if (methd.prototype.constructor.name == call)
							manager.remove(methd);
					});
					break;
			}
			if (!manager[0])
				this.removeEventListener(type, manager.handler, false);
		},
		clone: function () {
			switch (this.nodeType) {
				case 1:
					if (undefined != window.jQuery)
						return jQuery(this).clone(true)[0];
				default:
					var node = this.cloneNode(true);
					each(node.eventManager = this.eventManager, function (list, type) {
						node.addEventListener(type, function (e) {
							each(this.eventManager[type], function () {
								this();
							});
						}, false);
					});
					return node;
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
	["shift", "push", "pop", "splice", "unshift", "reverse"].forEach(function (name) {
		var method = Array.prototype[name];
		switch (name) {
			case "shift":
				Array.prototype[name] = function () {
					var data = method.apply(this, arguments);
					var watch = this.watch;
					if (watch)
						watch.call(this, name, [0]);
					return data;
				};
				break;
			case "push":
				Array.prototype[name] = function () {
					var data = method.apply(this, arguments);
					var watch = this.watch;
					if (watch)
						watch.call(this, name, [this.length]);
					return data;
				};
				break;
			case "pop":
				Array.prototype[name] = function () {
					var data = method.apply(this, arguments);
					var watch = this.watch;
					if (watch)
						watch.call(this, name, [this.length]);
					return data;
				};
				break;
			case "splice":
				Array.prototype[name] = function (i, l) {
					var data = method.apply(this, arguments);
					var watch = this.watch;
					if (watch) {
						var params = [];
						while (i < l) params.push(i++);
						watch.call(this, name, params);
					}
					return data;
				};
				break;
			default:
				Array.prototype[name] = function () {
					var data = method.apply(this, arguments);
					var watch = this.watch;
					if (watch)
						watch.call(this, name);
					return data;
				};
				break;
		}
	});
	var observe = function (obj, callSet, callGet) {
		var _observe = function (target, callSet, callGet, root, oldTarget) {
			if (Array.isArray(target)) {
				if (!target.watch)
					Object.defineProperty(target, "watch", {
						value: function (name, params) {
							params.forEach(function (index) {
								callSet.call(this, index, root + "." + index);
							}, this);
							eval("obj" + root.replace(/(\w+)\.?/g, "['$1']") + "=this");
						}
					});
			}
			if (typeof target == "object" && target != null) {
				Object.keys(target).forEach(function (prop) {
					var value = target[prop];
					var oldValue = oldTarget ? oldTarget[prop] : undefined;
					if (value == oldValue) {
						if (value && Object.getOwnPropertyDescriptor(target, prop).set) {
							return;
						}
					}
					if (target.hasOwnProperty(prop)) {
						var path = root ? root + "." + prop : prop;
						if (typeof value == "object") {
							_observe(value, callSet, callGet, path, oldValue);
						}
						_watch(target, prop, path);
					}
				})
			}
			return target;
		};
		var _watch = function (target, prop, path) {
			var value = target[prop];
			Object.defineProperty(target, prop, {
				get: function () {
					callGet.call(this, prop, path);
					return value;
				},
				set: function (val) {
					if (typeof value == "object") {
						var oldValue = value;
						_observe(value = val, callSet, callGet, path, oldValue);
						callSet.call(value, prop, path);
					} else if (value !== val) {
						callSet.call(value = val, prop, path);
					}
				}
			});
			callSet.call(target, prop, path);
		};
		return new _observe(obj, callSet, callGet);
	};
	window.observe = observe;
	window.query = query;
	window.each = each;
	window.slice = slice;
	window.$ = ready;
})(window);
