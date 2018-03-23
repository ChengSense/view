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

function observe(target, callSet, callGet, caches, queue) {

	function observe(object, root, oldObject) {

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

		if (!object.watch)

			Object.defineProperty(object, "watch", {

				get() {

					return queue;

				},

				set(parm) {

					queue.list.push(root), queue.open = false;

					parm.forEach(function (prop) {

						queue.list.push(root + "." + prop);

					});

					each(caches(), function (item, path) {

						callSet(path);

					});

				}

			});

	}

	function walk(object, prop, root, oldObject) {

		var value = object[prop], oldValue = (oldObject || {})[prop];

		var path = root ? root + "." + prop : prop;

		if (typeof value != "view" && typeof value == "object") {

			observe(value, path, oldValue);

		}

		if (value == oldValue && Object.getOwnPropertyDescriptor(object, prop).set) return;

		define(object, prop, path, oldValue);

	}

	function define(object, prop, path, oldValue) {

		var value = object[prop];

		Object.defineProperty(object, prop, {

			get() {

				callGet(path);

				return value;

			},

			set(val) {

				queue.list = [];

				var oldValue = value;

				observe(val, path, oldValue);

				value = val

				if (!queue.open) {

					queue.list.push(path);

					each(caches(), function (item, path) {

						callSet(path);

					});

				}

			}

		});

		queue.list.push(path);

	}

	observe(target);

}