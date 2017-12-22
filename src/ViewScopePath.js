import { $word1, $express } from "./ViewExpress";

export function codex(_express, _scope) {

	try {
		_express = "'" + _express.replace($express, "'+($1)+'") + "'";

		return Code(_express)(_scope);

	} catch (e) {

		return undefined;

	}

}

export function Code(_express) {

	return new Function('_scope',

		`with (_scope) {

			return `+ _express + `;

		 }`

	);

}

export function codes(_express, _scope) {

	try {

		return _scope["@" + _express] = _scope["@" + _express] || new Map();

	} catch (e) {

		return undefined;

	}

}

export function Path(path) {

	try {

		return path.replace(/(\w+)\.?/g, "['$1']");

	} catch (e) {

		return undefined;

	}

}
