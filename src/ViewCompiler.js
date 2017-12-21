

function code(_express, _scope) {
	try {
		$path = undefined;
		_express = _express.replace($express, "$1");
		return Code(_express)(_scope);
	} catch (e) {
		return undefined;
	}
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
						if (node.nodeType == 2)
							(node.ownerElement["@attr"] = node.ownerElement["@attr"] || []).push($path);
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
