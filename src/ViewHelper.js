import { $word1, $express } from "./ViewExpress";

export function classNode(newNode, child) {

	return {

		node: newNode,

		clas: child.clas,

		children: child.children,

		scope: child.scope,

		childNodes: []

	};

}

export function setVariable(scope, variable, path) {

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

export function binding(node, scope) {

	var owner = node.ownerElement;

	owner._express = node.nodeValue.replace($express, "$1");

	owner.on("change", function handle() {

		new Function('scope',

			`with (scope) {

				`+ owner._express + `='` + owner.value.replace(/(\'|\")/g, "\\$1") + `';

			 }`

		)(scope);

	});

}