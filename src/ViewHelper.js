import { $word1, $express } from "./ViewExpress";
import { Path } from "./ViewScopePath";

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

			return new Function('scope',
				`
				return scope`+ Path(path) + `;
		
				`
			)(scope);

		},

		set(val) {

			new Function('scope', 'val',
				`
				scope`+ Path(path) + `=val;

				`
			)(scope, val);

		}

	});

}

export function binding(node, scope) {

	var owner = node.ownerElement;

	owner._express = node.nodeValue.replace($express, "$1");

	owner.on("change", function handle() {

		new Function('scope',
			`
			scope`+ Path(owner._express) + `='` + owner.value.replace(/(\'|\")/g, "\\$1") + `';

			`
		)(scope);

	});

}