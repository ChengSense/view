function observe(target, callGet, callSet) {
	function _observe(object, callGet, callSet, root, oldObject) {
		if (Array.isArray(object)) {
			_array(object, root);
			object.forEach(function (value, prop) {
				if (object.hasOwnProperty(prop)) {
					_watch(object, value, prop, root, oldObject);
				}
			});
		} else {
			for (var prop in object) {
				if (object.hasOwnProperty(prop)) {
					_watch(object, object[prop], prop, root, oldObject);
				}
			}
		}
	}

	function _watch(object, value, prop, root, oldObject) {
		var oldValue = oldObject ? oldObject[prop] : undefined;
		var path = root ? root + "." + prop : prop;
		if (typeof value == "object") {
			_observe(value, callGet, callSet, path, oldValue);
		}
		_object(object, prop, path, callGet, callSet, oldValue);
	}

	function _array(object, path) {
		if (!object.watch) {
			Object.defineProperty(object, "watch", {
				set(val) {
					var value = _path(target, path);
					callSet(path, value, value);
				},
				get() {
					return true;
				}
			});
		}
	}

	function _object(object, prop, path, oldVal) {
		var value = object[prop], doit = false;
		Object.defineProperty(object, prop, {
			set(val) {
				var oldValue = value;
				_observe(value = val, callGet, callSet, path, oldValue)
				callSet(path, value, oldValue);
			},
			get() {
				callGet(path);
				return value;
			}
		});
	}

	function _path(object, path) {
		var value = object;
		path.replace(/\w+/g, function (key) {
			value = value[key];
		});
		return value;
	}

	_observe(target, callSet, callGet);
};

["shift", "push", "pop", "splice", "unshift", "reverse"].forEach(function (name) {
	var method = Array.prototype[name];
	Array.prototype[name] = function () {
		var data = method.apply(this, arguments);
		var watch = this.watch;
		if (watch)
			this.watch = this
		return data;
	};
});