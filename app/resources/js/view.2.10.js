(function () {
	var $express = /\{\s*\{>?@?([^\{\}]*)\}\s*\}/g;
	var $express1 = /\{\s*\{([^\{\}]*)\}\s*\}/;
	var $express2 = /\{\s*\{([^>@\{\}]*)\}\s*\}/g;
	var $html = /\{\s*\{\s*>([^\{\}]*)\}\s*\}/;
	var $view = /\{\s*\{\s*@([^\{\}]*)\}\s*\}/;
	var $each = /(@each)\s*\((.*)\s*,\s*\{/;
	var $when = /(@when)\s*\((.*)\s*,\s*\{/;
	var $else = /(@else)/;
	var $chen = /(@each|@when)\s*\((.*)\s*,\s*\{/;
	var $lang = /((@each|@when)\s*\((.*)\s*,\s*\{|\{\s*\{([^\{\}]*)\}\s*\}|\s*\}\s*\)|@else)/g;
	var $close = /\}\s*\)\s*/;
	var $break = /\}\s*\)|(@else)/;
	var $word = /(\w+)((\.\w+)|(\[(.+)\]))*/g;
	var $word1 = /\w+/g;
	function view(app) {
		var cache = {}, queue = { open: false, list: [] }, $path;
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
					node.node.nodeValue = codex(node.clas.nodeValue, scope);
					if (node.node.name == "value")
						node.node.ownerElement.value = node.node.nodeValue;
				} catch (e) {
					console.log(e);
				}
			},
			attribute: function (node, scope) {
				try {
					var newNode = document.createAttribute(codex(node.clas.name, scope));
					newNode.nodeValue = node.clas.nodeValue;
					node.node.ownerElement.setAttributeNode(newNode);
					node.node.ownerElement.removeAttributeNode(node.node);
					var children = codes(node.path, cache);
					var childNodes = children.get(node.clas);
					childNodes.clear();
					setComCache(newNode, scope, node.clas);
				} catch (e) {
					console.log(e);
				}
			},
			html: function (node, scope) {
				try {
					var insert = insertion([node]);
					var html = query(code(node.clas.nodeValue, scope));
					var comment = document.createComment(">" + $path);
					insert.parentNode.replaceChild(comment, insert);
					clearEachNode([node], node);
					node.childNodes = [];
					var nodes = initCompiler(init(slice(html)));
					var doc = document.createDocumentFragment();
					compiler(doc, scope, nodes, { childNodes: node.childNodes, childNode: node.childNode });
					setComCache(comment, scope, node);
					comment.after(doc);
					console.log(cache);
				} catch (e) {
					console.log(e);
				}
			},
			view: function (node, scope) {
				try {
					var insert = insertion([node]);
					var views = code(node.clas.nodeValue, scope);
					var comment = document.createComment("@" + $path);
					insert.parentNode.replaceChild(comment, insert);
					clearEachNode([node], node);
					node.childNodes = [];
					extend(views.model, scope);
					views.view(views["@view"], views.model);
					var doc = views.view;
					setComCache(comment, scope, node);
					comment.after(doc);
					console.log(cache);
				} catch (e) {
					console.log(e);
				}
			},
			"@view": function (node, scope) {
				try {
					app.view = resolver.init;
					console.log(cache);
				} catch (e) {
					console.log(e);
				}
			},
			each: function (node, scope, childNodes, path) {
				try {
					var insert = insertion([node]);
					childNodes.remove(node);
					clearEachNode([node], node);
					var doc = document.createDocumentFragment();
					compiler(doc, scope, [node], { childNodes: [], childNode: [] });
					insert.parentNode.replaceChild(doc, insert);
					console.log(cache);
				} catch (e) {
					console.log(e);
				}
			},
			when: function (node, scope, childNodes, path) {
				try {
					var insert = insertion([node]);
					clearWhenNode([node], node);
					var doc = document.createDocumentFragment();
					compiler(doc, scope, [node], { childNodes: [], childNode: [] });
					insert.parentNode.replaceChild(doc, insert);
					var children = codes(node.path, cache);
					var nodes = children.get(node.clas);
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
					var childNodes = children.get(node.clas);
					if (childNodes) {
						clearChenNode(childNodes);
						children.delete(node.clas);
						childNodes.clear();
						if (children.size == 0)
							delete cache["@" + node.path];
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
					var childNodes = children.get(node.clas);
					childNodes.remove(node);
					if (childNodes && !node) {
						clearChenNode(childNodes);
						children.delete(node.clas);
						childNodes.clear();
						if (children.size == 0)
							delete cache["@" + node.path];
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
				if (child.node && child.node.parentNode) {
					node = child.node;
					child.node = null;
					return node;
				}
				return node = insertion(child.childNodes);
			});
			return node;
		}
		function code(_express, _scope) {
			try {
				with (_scope) {
					_express = _express.replace($express, "$1");
					$path = undefined;
					return eval(_express);
				}
			} catch (e) {
				return undefined;
			}
		}
		function codex(_express, _scope) {
			try {
				with (_scope) {
					_express = "'" + _express.replace($express, "'+($1)+'") + "'";
					return eval(_express);
				}
			} catch (e) {
				return undefined;
			}
		}
		function codes(_express, _scope) {
			try {
				return _scope["@" + _express] = _scope["@" + _express] || new Map();
			} catch (e) {
				return undefined;
			}
		}
		function init(dom) {
			each(dom, function (node) {
				if (node.childNodes[0] && !(/(CODE|SCRIPT)/).test(node.nodeName))
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
				if (child.children[0])
					blankOut(child.children);
				if (child.clas.nodeValue && child.clas.nodeValue.trim() == "" || child.clas.nodeValue == "")
					dom.remove(child);
			});
			return dom;
		}
		function setCache(node, scope, clas, content, inode) {
			if (!clas.clas) return;
			switch (clas.clas.nodeType) {
				case 1:
					var key = clas.clas.getAttribute("each").split(":").pop();
					if (code(key, scope) == undefined || $path == undefined) return;
					var caches = codes($path, cache);
					clas.resolver = "each";
					clas.content = content;
					clas.scope = scope;
					clas.path = $path;
					clas.node = node;
					caches.setting(clas, inode);
					return;
				default:
					if (clas.clas.nodeValue)
						clas.clas.nodeValue.replace($each, function (key) {
							key = key.replace($each, "$2").split(":").pop();
							if (code(key, scope) == undefined || $path == undefined) return;
							var caches = codes($path, cache);
							clas.resolver = "each";
							clas.content = content;
							clas.scope = scope;
							clas.path = $path;
							clas.node = node;
							caches.setting(clas, inode);
						});
					if (clas.clas.nodeValue)
						clas.clas.nodeValue.replace($when, function (key) {
							key = key.replace($when, "$2");
							key.replace($word, function (key) {
								if (code(key, scope) == undefined || $path == undefined) return;
								var caches = codes($path, cache);
								clas.resolver = "when";
								clas.content = content;
								clas.scope = scope;
								clas.path = $path;
								clas.node = node;
								caches.setting(clas, inode);
							});
						});
					break;
			}
		}
		function setComCache(node, scope, clas) {
			if (node.name == "value")
				binding(node, scope);
			switch (clas.clas != undefined) {
				case true:
					if (clas.clas.nodeValue) {
						clas.clas.nodeValue.replace($express2, function (key) {
							key.replace($word, function (key) {
								if (code(key, scope) == undefined || $path == undefined) return;
								var caches = codes($path, cache);
								clas.resolver = "express";
								clas.scope = scope;
								clas.path = $path;
								clas.node = node;
								caches.setting(clas);
							});
						});
						clas.clas.nodeValue.replace($html, function (key) {
							key.replace($word, function (key) {
								if (code(key, scope) == undefined || $path == undefined) return;
								var caches = codes($path, cache);
								clas.resolver = "html";
								clas.scope = scope;
								clas.path = $path;
								clas.node = node;
								caches.setting(clas);
							});
						});
						clas.clas.nodeValue.replace($view, function (key) {
							key.replace($word, function (key) {
								if (code(key, scope) == undefined || $path == undefined) return;
								var caches = codes($path, cache);
								clas.resolver = "view";
								clas.scope = scope;
								clas.path = $path;
								clas.node = node;
								caches.setting(clas);
							});
						});
					}
					break;
				default:
					if (clas.name)
						clas.name.replace($express, function (key) {
							if (code(key, scope) == undefined || $path == undefined) return;
							var caches = codes($path, cache);
							caches.setting({
								resolver: "attribute",
								scope: scope,
								clas: clas,
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
									scope: scope,
									clas: clas,
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
				if ($close.test(child.nodeValue))
					return true;
				var item = { clas: child, children: [] };
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
		function commom(node, scope, clas) {
			each(node.attributes, function (child) {
				if ($express1.test(child.name)) {
					try {
						var node = document.createAttribute(codex(child.name, scope));
						node.nodeValue = child.nodeValue;
						child.ownerElement.setAttributeNode(node);
						child.ownerElement.removeAttributeNode(child);
						setComCache(node, scope, (clas.clas || clas).getAttributeNode(child.name));
						commom(node, scope, (clas.clas || clas).getAttributeNode(child.name));
					} catch (e) {
						console.log(child.name + "属性节点不允许为null或者''， " + child.name + "=" + child.nodeValue + "属性节点创建失败");
					}
				}
				commom(child, scope, (clas.clas || clas).getAttributeNode(child.name));
			});
			if (new RegExp($express2).test(node.nodeValue)) {
				setComCache(node, scope, clas);
				node.nodeValue = codex(node.nodeValue, scope);
			} else if ($html.test(node.nodeValue)) {
				resolver.html(clas, scope);
			} else if ($view.test(node.nodeValue)) {
				resolver.view(clas, scope);
			}
		}
		function classNode(newNode, child) {
			return {
				node: newNode,
				clas: child.clas,
				children: child.children,
				scope: child.scope,
				childNodes: []
			};
		}
		function setVariable(scope, variable, path) {
			Object.defineProperty(scope, variable, {
				get() {
					var value = scope;
					path.replace($word1, function (express) {
						value = value[express];
					});
					return value;
				},
				set(val) {
					var paths = path.split("."), prop = paths.pop(), value = scope;
					paths.forEach(function (express) {
						value = value[express];
					});
					value[prop] = val;
				}
			});
		}
		function compiler(node, iscope, childNodes, content) {
			each(childNodes, function (child, index, childNodes) {
				if ($break.test(child.clas.nodeValue))
					return childNodes.clear();
				switch (child.clas.nodeType) {
					case 1:
						if (child.clas.hasAttribute("each")) {
							var expreses = child.clas.getAttribute("each").split(":");
							var variable = expreses.shift().trim(), source = expreses.pop().trim(), id = expreses.shift();
							var dataSource = code(source, iscope);

							node.appendChild(document.createComment($path));
							var clas = classNode(null, child);
							content.childNodes.push(clas);
							setCache(null, iscope, clas, content, node);

							each(dataSource, function (item, index) {
								var scope = Object.create(iscope || {});
								setVariable(scope, variable, $path);
								if (id) scope[id.trim()] = index.toString();
								var newNode = child.clas.cloneNode();
								newNode.removeAttribute("each");
								node.appendChild(newNode);
								var clasNodes = classNode(newNode, child);
								clas.childNodes.push(clasNodes);
								compiler(newNode, scope, slice(child.children), clasNodes);
								commom(newNode, scope, child.clas);
							});
						} else {
							switch ((/(CODE|SCRIPT)/).test(child.clas.nodeName)) {
								case true:
									var newNode = child.clas.cloneNode(true);
									node.appendChild(newNode);
									var clasNodes = classNode(newNode, child);
									content.childNodes.push(clasNodes);
									break;
								default:
									var newNode = child.clas.cloneNode();
									node.appendChild(newNode);
									var clasNodes = classNode(newNode, child);
									content.childNodes.push(clasNodes);
									compiler(newNode, iscope, slice(child.children), clasNodes);
									commom(newNode, iscope, clasNodes);
									break;
							}
						}
						break;
					default:
						if ($each.test(child.clas.nodeValue)) {
							var expreses = child.clas.nodeValue.replace($each, "$2").split(":");
							var variable = expreses.shift().trim(), source = expreses.pop().trim(), id = expreses.shift();
							var dataSource = code(source, iscope);

							node.appendChild(document.createComment($path));
							var clas = classNode(null, child);
							content.childNodes.push(clas);
							setCache(null, iscope, clas, content, node);

							each(dataSource, slice(child.children), function (item, index, children) {
								var scope = Object.create(iscope || {});
								setVariable(scope, variable, $path);
								if (id) scope[id.trim()] = index.toString();
								var clasNodes = classNode(null, child);
								clas.childNodes.push(clasNodes);
								compiler(node, scope, slice(children), clasNodes);
							});
						} else if ($when.test(child.clas.nodeValue)) {
							var clas = classNode(null, child);
							content.childNodes.push(clas);
							setCache(null, iscope, clas, content, node);
							var when = code(child.clas.nodeValue.replace($when, "$2"), iscope);
							if (when) {
								each(slice(child.children), function (child, index, childNodes) {
									if ($break.test(child.clas.nodeValue))
										return true;
									switch (child.clas.nodeType == 1 || $chen.test(child.clas.nodeValue)) {
										case true:
											compiler(node, iscope, childNodes, clas);
											break;
										default:
											var newNode = child.clas.cloneNode();
											node.appendChild(newNode);
											var clasNodes = classNode(newNode, child);
											clas.childNodes.push(clasNodes);
											commom(newNode, iscope, clasNodes);
											break;
									}
									childNodes.shift();
								});
							} else {
								each(slice(child.children), function (child, index, childNodes) {
									childNodes.shift();
									if ($else.test(child.clas.nodeValue)) {
										each(childNodes, function (child, index, childNodes) {
											switch ($chen.test(child.clas.nodeValue) || child.clas.nodeType == 1) {
												case true:
													compiler(node, iscope, childNodes, clas);
													break;
												default:
													var newNode = child.clas.cloneNode();
													node.appendChild(newNode);
													var clasNodes = classNode(newNode, child);
													clas.childNodes.push(clasNodes);
													commom(newNode, iscope, clasNodes);
													break;
											}
											childNodes.shift();
										});
									}
								});
							}
						} else {
							var newNode = child.clas.cloneNode();
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
				with (scope) {
					eval(owner._express + "='" + owner.value.replace(/(\'|\")/g, "\\$1") + "'");
				}
			});
		}
		function caches() {
			var caches = {};
			while (queue.list.length) {
				var path = queue.list.shift();
				var node = cache["@" + path];
				caches[path] = node;
			}
			each(caches, function (map, key) {
				if (map) map.forEach(function (childNodes) {
					var node = childNodes[0];
					if (node && node.resolver.match(/(each|html|view)/))
						return merge(node.childNodes);
					slice(childNodes).forEach(function (node) {
						merge(node.childNodes);
					});
				});
			});
			function merge(nodes) {
				if (nodes)
					nodes.forEach(function (node) {
						if (node.path) {
							var children = caches[node.path];
							if (children) {
								var childNodes = children.get(node.clas);
								if (childNodes) {
									children.delete(node.clas);
									if (children.size == 0) {
										delete caches[node.path];
										delete cache["@" + node.path];
									}
								}
							}
						}
						if (node.childNodes)
							merge(node.childNodes);
					});
			}
			return caches;
		}
		observe(app.model, function callSet(path) {
			var nodes = cache["@" + path] || [];
			slice(nodes).forEach(function (childNodes, clas) {
				var node = childNodes[0];
				if (node && node.resolver == "each")
					return resolver[node.resolver](node, node.scope, childNodes, path);
				if (node && node.resolver == "html")
					return resolver[node.resolver](node, node.scope);
				if (node && node.resolver == "view")
					return resolver[node.resolver](node, node.scope);
				slice(childNodes).forEach(function (node) {
					resolver[node.resolver](node, node.scope, childNodes, path);
				});
			});
		}, function callGet(path) {
			$path = path;
		}, caches, queue);
		resolver[app.view ? "init" : "@view"](app.view, app.model);
		extend(this, app);
		return this;
	}
	function extend(object, parent) {
		object.__proto__ = parent;
		return object;
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
			var newNode = document.createElement("div");
			newNode.innerHTML = express;
			return newNode.childNodes;
		}
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
			for (var i = 0; i < length; i = i + 1 - length + obj.length) {
				length = obj.length;
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
			var childNodes = this.get(k.clas);
			if (childNodes) {
				k.node = n.childNodes[n.childNodes.length - 1];
				childNodes.push(k);
			} else {
				k.node = n.childNodes[n.childNodes.length - 1];
				this.set(k.clas, [k]);
			}
		},
		chen: function (k, n) {
			var childNodes = this.get(k.clas);
			if (childNodes) {
				childNodes.push(k);
			} else {
				this.set(k.clas, [k])
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
		on: function (type, select, methd, bol) {
			var manager = this["@Manager"] = this["@Manager"] || {};
			var methds = manager[type] = manager[type] || [];
			methds.push(methd ? { select: select, methd: methd } : select);
			if (manager["@" + type]) return this;
			switch (methd) {
				case undefined:
					this.addEventListener(type, manager["@" + type] = function (event) {
						var node = event.target;
						methds.forEach(function (methd) {
							methd.call(node, event);
						})
					}, bol);
					break;
				default:
					this.addEventListener(type, manager["@" + type] = function (event) {
						var node = event.target;
						methds.forEach(function (methd) {
							if (node.parentNode)
								each(node.parentNode.querySelectorAll(methd.select), function (child) {
									if (child.isSameNode(node))
										methd.methd.call(child, event);
								})
						})
					}, bol);
					break;
			}
			return this;
		},
		off: function (type, call) {
			try {
				var manager = this["@Manager"];
				switch (typeof call) {
					case "string":
						manager[type].forEach(function (methd) {
							methd = typeof (methd) == "object" ? methd.methd : methd;
							if (methd.prototype.constructor.name == call)
								manager[type].remove(methd);
						});
						break;
					case "function":
						manager[type].remove(call);
						break;
					case "undefined":
						manager[type].clear();
						break;
				}
				if (!manager[type][0])
					this.removeEventListener(type, manager["@" + type], false);
			} catch (e) {
				console.log(e);
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
	["shift", "push", "pop", "splice", "unshift", "reverse"].forEach(function (name) {
		var method = Array.prototype[name];
		switch (name) {
			case "shift":
				Array.prototype[name] = function () {
					var watch = this.watch;
					if (watch) watch.open = true;
					var data = method.apply(this, arguments);
					if (watch)
						this.watch = [0];
					return data;
				};
				break;
			case "pop":
				Array.prototype[name] = function () {
					var watch = this.watch;
					if (watch) watch.open = true;
					var data = method.apply(this, arguments);
					if (watch)
						this.watch = [this.length];
					return data;
				};
				break;
			case "splice":
				Array.prototype[name] = function (i, l) {
					var watch = this.watch;
					if (watch) watch.open = true;
					var data = method.apply(this, arguments);
					if (watch) {
						var params = [], m = new Number(i) + new Number(l);
						while (i < m) params.push(i++);
						this.watch = params;
					}
					return data;
				};
				break;
			default:
				Array.prototype[name] = function () {
					var watch = this.watch;
					if (watch) watch.open = true;
					var data = method.apply(this, arguments);
					if (watch)
						this.watch = [];
					return data;
				};
				break;
		}
	});
	var observe = function (target, callSet, callGet, caches, queue) {
		function _observe(object, root, oldObject) {
			if (Array.isArray(object)) {
				_array(object, root);
				for (var prop = 0; prop < object.length; prop++) {
					if (object.hasOwnProperty(prop)) {
						_watch(object, prop, root, oldObject);
					}
				}
			} else if (typeof object == "object") {
				for (var prop in object) {
					if (object.hasOwnProperty(prop)) {
						_watch(object, prop, root, oldObject);
					}
				}
			}
			return object;
		};
		function _watch(object, prop, root, oldObject) {
			var value = object[prop];
			var oldValue = oldObject ? oldObject[prop] : undefined;
			if (value == oldValue) {
				if (value && Object.getOwnPropertyDescriptor(object, prop).set) {
					return;
				}
			}
			var path = root ? root + "." + prop : prop;
			if (!(value instanceof view) && typeof value == "object") {
				_observe(value, path, oldValue);
			}
			_define(object, prop, path, oldValue);
		}
		function _array(object, root) {
			if (!object.watch)
				Object.defineProperty(object, "watch", {
					set(parm) {
						eval("target" + root.replace(/(\w+)\.?/g, "['$1']") + "=this");
						parm.forEach(function (prop) {
							queue.list.push(root + "." + prop);
						});
						queue.list.push(root);
						queue.open = false;
						each(caches(), function (item, path) {
							callSet(path);
						});
					},
					get() {
						return queue;
					}
				});
		}
		function _define(object, prop, path, oldValue) {
			var value = object[prop];
			Object.defineProperty(object, prop, {
				set(val) {
					var oldValue = value;
					_observe(value = val, path, oldValue);
					if (!queue.open) {
						queue.list = [];
						queue.list.push(path);
						each(caches(), function (item, path) {
							callSet(path);
						});
					}
				},
				get() {
					callGet(path);
					return value;
				}
			});
			queue.list.push(path);
		};
		_observe(target);
	};
	window.observe = observe;
	window.query = query;
	window.each = each;
	window.slice = slice;
})(window);