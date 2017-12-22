import { each } from "./ViewLang";
import { Path } from "./ViewScopePath";

export function observe(target, callSet, callGet, caches, queue) {

	function watcher(object, root, oldObject) {

		if (Array.isArray(object)) {

			array(object, root);

			for (var prop = 0; prop < object.length; prop++) {

				if (object.hasOwnProperty(prop)) {

					walk(object, prop, root, oldObject);

				}

			}

		} else if (typeof object == "object") {

			for (var prop in object) {

				if (object.hasOwnProperty(prop)) {

					walk(object, prop, root, oldObject);

				}

			}

		}

	}

	function array(object, root) {

		var prototype = Array.prototype;

		["shift", "push", "pop", "splice", "unshift", "reverse"].forEach(function (name) {

			var method = prototype[name];

			switch (name) {

				case "shift":

					object[name] = function () {

						queue.open = true;

						var data = method.apply(this, arguments);

						notify([0]);

						return data;

					};

					break;

				case "pop":

					object[name] = function () {

						queue.open = true;

						var data = method.apply(this, arguments);

						notify([this.length]);

						return data;

					};

					break;

				case "splice":

					object[name] = function (i, l) {

						queue.open = true;

						var data = method.apply(this, arguments);

						var params = [], m = new Number(i) + new Number(l);

						while (i < m) params.push(i++);

						notify(params);

						return data;

					};

					break;

				default:

					object[name] = function () {

						queue.open = true;

						var data = method.apply(this, arguments);

						notify([]);

						return data;

					};

					break;

			}

		});

		function notify(parm) {

			queue.open = false;

			setValue(object, root);

			parm.forEach(function (prop) {

				queue.list.push(root + "." + prop);

			});

			publish(root);

		}

	}

	function setValue(object, path) {

		new Function('scope', 'val',
			`
			scope`+ Path(path) + `=val;

			`
		)(target, object);

	}

	function walk(object, prop, root, oldObject) {

		var value = object[prop], oldValue = (oldObject || {})[prop];

		var path = root ? root + "." + prop : prop;

		if (typeof value != "view" && typeof value == "object") {

			watcher(value, path, oldValue);

		}

		define(object, prop, path, oldValue, mq);

	}

	function define(object, prop, path, oldValue, ) {

		var value = object[prop];

		Object.defineProperty(object, prop, {

			get() {

				mq.publish("get." + path, [path]);

				return value;

			},

			set(val) {

				queue.list = [];

				var oldValue = value;

				subscribe(path);

				watcher(value = val, path, oldValue);

				if (!queue.open) publish(path);

			}

		});

		subscribe(path);

		queue.list.push(path);

	}

	function subscribe(path) {

		try {

			mq.clear(path);

			if (callGet) mq.subscribe("get." + path, callGet);

			mq.subscribe("set." + path, callSet);

		} finally {

		}

	}

	function publish(path) {

		try {

			queue.list.push(path);

			each(caches(), function (item, path) {

				mq.publish("set." + path, [path]);

			});

			mq.gc(target);

		} finally {

		}

	}

	watcher(target);

}

class Mes extends Map {

	publish(event, data) {

		const cache = this.get(event)

		if (cache) {

			cache.data.push(data);

		} else {

			this.set(event, { data: [data], queue: [] });

		}

		this.notify(cache);

	}

	subscribe(event, call) {

		if (!call) return;

		const cache = this.get(event);

		if (cache) {

			cache.queue.push(call);

		} else {

			this.set(event, { data: [], queue: [call] });

		}

	}

	notify(cache) {

		if (cache) {

			while (cache.data.length) {

				const data = cache.data.shift();

				cache.queue.forEach(function (call) {

					call(data[0], data[1], data[2]);

				})

			}

		} else {

			this.forEach(function (cache) {

				while (cache.data.length) {

					const data = cache.data.shift();

					cache.queue.forEach(function (call) {

						call(data[0], data[1], data[2]);

					})

				}

			});

		}

	}

	clear(path) {

		if (path) {

			this.delete("set." + path);

			this.delete("get." + path);

		} else {

			this.forEach(function (cache, path) {

				this.delete(path);

			}, this);
		}

	}

	gc(target) {

		const map = this;

		setTimeout(function () {

			map.forEach(function (cache, path) {

				if (get(path.replace(/(set\.|get\.)/, "")) == undefined)

					map.delete(path);

			});

		}, 500);

		function get(path) {

			try {

				return new Function('scope',
					`
					return scope`+ Path(path) + `;
					`
				)(target);

			} catch (e) {

				return undefined;

			}

		}

	}

}

var mq = new Mes();

