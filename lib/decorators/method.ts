import { TypedModel, wrapValidator } from '..';

export type MiddleWareFunction = (next, done?) => void;

export interface MiddleWareHook {
	init?: [MiddleWareFunction] | MiddleWareFunction;
	validate?: [MiddleWareFunction] | MiddleWareFunction;
	save?: [MiddleWareFunction] | MiddleWareFunction;
	remove?: [MiddleWareFunction] | MiddleWareFunction;
}

export interface MethodOptions<T> {
	pre?: [keyof MiddleWareHook];
	post?: [keyof MiddleWareHook];
	validate?: [keyof T];
	message?: string;
}

export interface MethodSignature {
	middlewares: {
		function: Function;
		pre: string[];
		post: string[];
	};
	validate: {
		validator: Function;
		properties: string[];
		message: string;
	};
}

export function method<T>(
	sign: MethodOptions<T>
) {
	return (target: T, key: string, descriptor: PropertyDescriptor) => {
		saveMethodSignature<T>(target, key, descriptor, sign);
	};
}

function saveMethodSignature<T>(target: T, methodKey: string, descriptor: PropertyDescriptor, sign: MethodOptions<T>) {
	const constructor = (target.constructor as any);
	if (!constructor._sign) {
		constructor._sign = [];
	}

	const methodMeta: [MethodSignature] = constructor._sign;

	const signature: MethodSignature = {
		middlewares: {
			function: wrapMiddleware(target[methodKey], constructor),
			pre: [],
			post: []
		},
		validate: {
			validator: wrapValidator(target[methodKey], constructor),
			properties: [],
			message: ''
		}
	};

	// Pre-hooks
	if (sign.pre) {
		if (!(Array.isArray(sign.pre) || typeof sign.pre === 'string')) throw new Error(`Middleware not declard properly`);
		signature.middlewares.pre = <[string]>(Array.isArray(sign.pre) ? sign.pre : [sign.pre]);
	}

	// Post-hooks
	if (sign.post) {
		if (!(Array.isArray(sign.post) || typeof sign.post === 'string')) throw new Error(`Middleware not declard properly`);
		signature.middlewares.post = <[string]>(Array.isArray(sign.post) ? sign.post : [sign.post]);
	}

	// Validates
	if (sign.validate) {
		if (!(Array.isArray(sign.validate) || typeof sign.validate === 'string')) throw new Error(`Middleware not declard properly`);
		signature.validate.properties = <[string]>(Array.isArray(sign.validate) ? sign.validate : [sign.validate]);
	}

	methodMeta.push(signature);
}

export function wrapMiddleware(fn: Function, constructor) {

	let isAsync = fn.length === 2;

	if (isAsync) {
		return function (next, done) {
			let context = this['_typedObject'] ? this['_typedObject'] : this;
			return fn.bind(context)(next, done);
		};
	} else {
		return function (next) {
			let context = this['_typedObject'] ? this['_typedObject'] : this;
			return fn.bind(context)(next);
		};
	}
}
