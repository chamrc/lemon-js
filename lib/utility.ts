function mapValuesOfObject(obj, deepMapper) {
	return Object.keys(obj).reduce((res, key) => {
		res[key] = deepMapper(obj[key], key);
		return res;
	}, {});
}

export function deepMapValues(obj, fn) {
	const deepMapper = (val, key, arr) => typeof val === 'object' ? deepMapValues(val, fn) : fn(val, key);
	if (Array.isArray(obj)) return obj.map(deepMapper);
	if (typeof obj === 'object') return mapValuesOfObject(obj, deepMapper);
	return obj;
}

function mapKeys(object, iteratee) {
	object = Object(object);
	const result = {};

	Object.keys(object).forEach((key) => {
		const value = object[key];
		result[iteratee(value, key, object)] = value;
	});
	return result;
}

function isObject(value) {
	const type = typeof value;
	return value != null && (type === 'object' || type === 'function');
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
				if (typeof val === 'function') {
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
