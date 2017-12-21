
export function proto(object, parent) {

	object.__proto__ = parent;

	return object;

}

export function extend(object, src) {

	var prototype = object.prototype || object.__proto__;

	for (var key in src) {

		prototype[key] = src[key];

	}

	return object;

}

export function each(obj, arg, callback) {

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

export function slice(obj) {

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

