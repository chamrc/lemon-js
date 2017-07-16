import { TypedModel } from '..';

/************************************************
 *
 * Map context
 *
 ************************************************/

function extendContext(obj, deepMapper) {
	let subCtx = Object.keys(obj).reduce((res, key) => {
		let orig = {};
		orig[key] = obj[key];
		let result = deepMapper(obj[key], key, obj);
		deepExtend(res, orig, result);
		return res;
	}, {});
	return subCtx;
}

export function deepExtendContext(obj, fn, objCtx?, objKey?) {
	const deepMapper = (val, key, ctx) => typeof val === 'object' ? deepExtendContext(val, fn, ctx, key) : fn(val, key, ctx);

	let result, subCtx;
	if (Array.isArray(obj)) {
		result = obj.map(deepMapper).reduce((acc, val) => acc.concat(val), []);
		deepExtend(obj, result);
		subCtx = fn(obj, objKey, objCtx);
	} else if (typeof obj === 'object') {
		result = extendContext(obj, deepMapper);
		deepExtend(obj, result);
		subCtx = fn(obj, objKey, objCtx);
	}

	if (!objKey) return obj;
	else return Array.isArray(subCtx) ? [obj].concat(subCtx) : deepExtend(objectFromData(objKey, obj), subCtx);
}

/************************************************
 *
 * Map values
 *
 ************************************************/

function mapValues(obj, deepMapper) {
	let result = Object.keys(obj).reduce((res, key) => {
		res[key] = deepMapper(obj[key], key, obj);
		return res;
	}, {});
	return result;
}

export function deepMapValues(obj, fn) {
	const deepMapper = (val, key, ctx) => typeof val === 'object' ? deepMapValues(val, fn) : fn(val, key, ctx);
	if (Array.isArray(obj)) return obj.map(deepMapper);
	if (typeof obj === 'object') return mapValues(obj, deepMapper);
	return obj;
}

/************************************************
 *
 * Map keys
 *
 ************************************************/

function mapKeys(object, fn) {
	object = Object(object);
	const result = {};

	Object.keys(object).forEach((key) => {
		const value = object[key];
		result[fn(value, key, object)] = value;
	});

	return result;
}

export function deepMapKeys(obj, fn) {
	if (!isObject(obj)) {
		return obj;
	} else {
		obj = mapKeys(obj, fn);
		let res = {};
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				const val = obj[key];
				if (typeof val === 'function' ||
					(val.constructor && typeof val.constructor === 'function')) {
					res[key] = val;
				} else if (Array.isArray(val)) {
					res[key] = val.map((value, idx) => isObject(value) ? deepMapKeys(value, fn) : value);
				} else if (isObject(val)) {
					res[key] = deepMapKeys(val, fn);
				} else {
					res[key] = val;
				}
			}
		}

		return res;
	}
}

/************************************************
 *
 * Helpers
 *
 ************************************************/

export function objectFromData(key, value) {
	let result = {};
	result[key] = value;
	return result;
}

/************************************************
 *
 * Type checker
 *
 ************************************************/

function isObject(value) {
	const type = typeof value;
	return value != null && (type === 'object' || type === 'function');
}

export function isTypedModel(obj: any) {
	return obj && (obj._meta || obj._model || obj._schema);
}

/************************************************
 *
 * Find by path
 *
 ************************************************/

export function getPath(obj, path) {
	if (typeof path === 'string') {
		path = path.split('.');
	}

	if (!Array.isArray(path)) {
		path = path.concat();
	}

	return path.reduce(function (o, part) {
		let keys = part.match(/\[(.*?)\]/);
		if (keys) {
			let key = part.replace(keys[0], '');
			return o[key][keys[1]];
		}
		return o[part];
	}, obj);
}

/************************************************
 *
 * Deep clone
 *
 ************************************************/

function isSpecificValue(val) {
	return (
		val instanceof Buffer
		|| val instanceof Date
		|| val instanceof RegExp
	) ? true : false;
}

function cloneSpecificValue(val) {
	if (val instanceof Buffer) {
		let x = new Buffer(val.length);
		val.copy(x);
		return x;
	} else if (val instanceof Date) {
		return new Date(val.getTime());
	} else if (val instanceof RegExp) {
		return new RegExp(val);
	} else {
		throw new Error('Unexpected situation');
	}
}

/**
 * Recursive cloning array.
 */
function deepCloneArray(arr) {
	let clone = [];
	arr.forEach(function (item, index) {
		if (typeof item === 'object' && item !== null) {
			if (Array.isArray(item)) {
				clone[index] = deepCloneArray(item);
			} else if (isSpecificValue(item)) {
				clone[index] = cloneSpecificValue(item);
			} else {
				clone[index] = deepExtend({}, item);
			}
		} else {
			clone[index] = item;
		}
	});
	return clone;
}

function deepExtend(...params: any[]) {
	if (arguments.length < 1 || typeof arguments[0] !== 'object') {
		return false;
	}

	if (arguments.length < 2) {
		return arguments[0];
	}

	let target = arguments[0];

	// convert arguments to array and cut off target object
	let args = Array.prototype.slice.call(arguments, 1);

	let val, src, clone;

	args.forEach(function (obj) {
		// skip argument if isn't an object, is null, or is an array
		if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
			return;
		}

		Object.keys(obj).forEach(function (key) {
			src = target[key]; // source value
			val = obj[key]; // new value

			// recursion prevention
			if (val === target) {
				return;

				/**
				 * if new value isn't object then just overwrite by new value
				 * instead of extending.
				 */
			} else if (typeof val !== 'object' || val === null) {
				target[key] = val;
				return;

				// just clone arrays (and recursive clone objects inside)
			} else if (Array.isArray(val)) {
				target[key] = deepCloneArray(val);
				return;

				// custom cloning anderwrite for specific objects
			} else if (isSpecificValue(val)) {
				target[key] = cloneSpecificValue(val);
				return;

				// overwrite by new value if source isn't object or array
			} else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
				target[key] = deepExtend({}, val);
				return;

				// source value and new value is objects both, extending...
			} else {
				target[key] = deepExtend(src, val);
				return;
			}
		});
	});

	return target;
}

/************************************************
 *
 * Clone
 *
 ************************************************/

/**
 * This method that clones object literals, any primitives, arrays and nodes.
 * But does NOT create a new object but rather retain a reference to that object.
 */
export function clone(item) {
	if (!item) { return item; } // null, undefined values check

	let types = [Number, String, Boolean],
		result;

	// normalizing primitives if someone did new String('aaa'), or new Number('444');
	types.forEach(function (type) {
		if (item instanceof type) {
			result = type(item);
		}
	});

	if (typeof result === 'undefined') {
		if (Object.prototype.toString.call(item) === '[object Array]') {
			result = [];
			item.forEach(function (child, index, array) {
				result[index] = clone(child);
			});
		} else if (typeof item === 'object') {
			// testing that this is DOM
			if (item.nodeType && typeof item.cloneNode === 'function') {
				result = item.cloneNode(true);
			} else if (!item.prototype) { // check that this is a literal
				if (item instanceof Date) {
					result = new Date(item);
				} else {
					// it is an object literal
					result = {};
					// tslint:disable:forin
					for (let i in item) {
						result[i] = clone(item[i]);
					}
				}
			} else {
				// depending what you would like here,
				// just keep the reference, or create new object
				if (false && item.constructor) {
					// would not advice to do that, reason? Read below
					// result = new item.constructor();
				} else {
					result = item;
				}
			}
		} else {
			result = item;
		}
	}

	return result;
}
