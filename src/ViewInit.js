
import { each, slice } from "./ViewLang";
import { $chen, $lang, $close } from "./ViewExpress";

export function init(dom) {

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

export function blankOut(dom) {

	each(dom, function (child) {

		if (child.children[0])

			blankOut(child.children);

		if (child.clas.nodeValue && child.clas.nodeValue.trim() == "" || child.clas.nodeValue == "")

			dom.remove(child);

	});

	return dom;

}

export function initCompiler(node, children) {

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