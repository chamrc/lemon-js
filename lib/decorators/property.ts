import { Schema, SchemaOptions, SchemaTypeOpts } from 'mongoose';
import 'reflect-metadata';
import { clone, deepExtendContext, deepMapKeys, deepMapValues, isTypedModel, TypedModel } from '..';

export interface TypeOptions<T> extends SchemaTypeOpts<T> {
	// From lemon-js
	ref?: Constructor;
	refer?: Constructor;
	subdoc?: boolean | SchemaOptions;
}
export type SchemaTypeOptions<T> = TypeOptions<T> | { [key: string]: any };

export type Constructor = {
	new(...args): any
};

/************************************************
 *
 * @property definition
 *
 ************************************************/

export function property<T>(target: TypedModel, propertyKey: string): void;
export function property<T>(
	meta: SchemaTypeOptions<T>
): (target: TypedModel, propertyKey: string) => void;
export function property<T>(
	targetOrMeta: TypedModel | SchemaTypeOptions<T>,
	propertyKey?: string,
) {
	if (targetOrMeta instanceof TypedModel) {
		savePropertyMeta(targetOrMeta, propertyKey);
		return;
	}

	const meta = targetOrMeta;
	return (target: TypedModel, propKey: string) => {
		savePropertyMeta(target, propKey, meta);
	};
}

function savePropertyMeta(target: TypedModel, propertyKey: string, meta: any = {}) {
	const constructor = (target.constructor as any);
	if (!constructor._meta) {
		constructor._meta = {
			// Properties that include TypedModel constructor and other flags
			rawProperties: {},
			// Properties will be passed to Mongoose
			properties: {},
			schemaOptions: {}
		};
	}

	const propsMeta: object = constructor._meta.properties;
	const propRawMeta: object = constructor._meta.rawProperties;

	/************************************************
	 *
	 * Preprocess metadata
	 *
	 ************************************************/

	// Map all refer (as a alias) to ref
	meta = deepMapKeys(meta, (val, key) => key === 'refer' ? 'ref' : key);

	// Add a new key to be ref's sibling if doesn't exist
	meta = deepExtendContext(meta, (val, key, ctx) => {
		if (key === 'ref' && !Array.isArray(ctx) && !ctx.type) {
			return { type: Schema.Types.ObjectId };
		}

		return Array.isArray(ctx) ? [] : {};
	});

	if (meta.subdoc || (Array.isArray(meta) && meta.length >= 1 && meta[0].subdoc)) {
		/************************************************
		 *
		 * Sub-documents / Subdocs
		 *
		 ************************************************/

		let isSingleNested = Boolean(meta.subdoc);
		if (!isSingleNested) {
			if (meta.length !== 1) throw new Error(`Expecting one element for property definition of ${ propertyKey }.`);
			meta = meta[0];
		}
		let schemaOptions = meta.subdoc;
		let isBoolean = typeof schemaOptions === 'boolean';

		// Creates a raw metadata that stores TypedModel constructor instead of Collection Name.
		let rawMeta = clone(meta);
		delete meta.subdoc;

		meta = deepMapValues(meta, (val, key, ctx) => {
			if (key === 'ref') {
				if (!isTypedModel(val)) throw new Error(`Referenced type for ${ propertyKey } is not a subclass of 'TypedModel.'`);
				return val.name;
			}
			return val;
		});

		let childSchema = new Schema(meta, isBoolean ? undefined : schemaOptions);

		propRawMeta[propertyKey] = isSingleNested ? meta : [meta];
		propsMeta[propertyKey] = isSingleNested ? childSchema : [childSchema];
	} else {
		/************************************************
		 *
		 * Validators
		 *
		 ************************************************/

		if (meta.validate) {
			let newValidate;

			if (Array.isArray(meta.validate)) {
				if (meta.validate.length === 2 &&
					typeof meta.validate[0] === 'function' &&
					typeof meta.validate[1] === 'string') {
					// var custom = [validator, 'Uh oh, {PATH} does not equal "something".']
					// new Schema({ name: { type: String, validate: custom } });
					newValidate = {
						isAsync: meta.validate[0].length === 2,
						validator: wrapValidator(meta.validate[0], constructor),
						message: meta.validate[1]
					};
				} else {
					// let many = [
					// 	{ validator: validator, message: 'uh oh' },
					// 	{ validator: anotherValidator, message: 'failed' }
					// ];
					// new Schema({ name: { type: String, validate: many } });
					newValidate = meta.validate.map((x) => {
						return {
							isAsync: x.validator.length === 2,
							validator: wrapValidator(x.validator, constructor),
							message: x.msg ? x.msg : x.message
						};
					});
				}
			} else if (typeof meta.validate === 'function') {
				// new Schema({ name: { type: String, validate: function validator(val) {} } });
				newValidate = {
					isAsync: meta.validate.length === 2,
					message: '',
					validator: wrapValidator(meta.validate, constructor)
				};
			} else {
				// new Schema({ name: { type: String, validate: {
				// 	validator: function validator(val, cb) {}
				// }}});
				newValidate = {
					isAsync: meta.validate.validator.length === 2,
					validator: wrapValidator(meta.validate.validator, constructor),
					message: meta.validate.message
				};
			}

			meta.validate = newValidate;
		}

		/************************************************
		 *
		 * Types
		 *
		 ************************************************/

		// Set type according to metadata generated by typescript
		if (!meta.type) {
			const type = Reflect.getMetadata('design:type', target, propertyKey);

			if (meta.ref && Array.isArray(meta.ref)) {
				if (meta.ref.length !== 1) throw new Error(`Expecting one referenced type for ${ propertyKey }, but received [${ meta.refer.map(x => x.name ? x.name : x.toString()).join(',') }].`);
				if (!isTypedModel(meta.ref[0])) throw new Error(`Referenced type for ${ propertyKey } is not a subclass of 'TypedModel.'`);
				let metaType = meta.ref[0];
				meta = [{ ref: metaType, type: Schema.Types.ObjectId }];
			} else {
				if (type) {
					if (isTypedModel(type)) {
						meta.ref = type;
						meta.type = Schema.Types.ObjectId;
					} else if (isTypedModel(meta.ref)) {
						meta.type = Schema.Types.ObjectId;
					} else {
						meta.type = type;
					}
				} else {
					const name = constructor.name;
					throw new Error(
						`Type of ${ name }.${ propertyKey } isn't set. Uf you use typescript ` +
						'you need to enable emitDecoratorMetadata in tsconfig.json',
					);
				}
			}
		}

		let rawMeta = clone(meta);
		meta = deepMapValues(meta, (val, key, ctx) => {
			if (key === 'ref') {
				if (Array.isArray(val) && val.length === 1 && isTypedModel(val[0]) && val[0].name) {
					return val[0].name;
				} else if (isTypedModel(val) && val.name) {
					return val.name;
				}
			}

			return val;
		});

		propRawMeta[propertyKey] = rawMeta;
		propsMeta[propertyKey] = meta;
	}
}

export function wrapValidator(validator, constructor) {
	let isAsync = validator.length === 2;

	if (isAsync) {
		return function (value, callback) {
			let context = this['_typedObject'] ? this['_typedObject'] : this;
			return validator.bind(context)(value, callback);
		};
	} else {
		return function (value) {
			let context = this['_typedObject'] ? this['_typedObject'] : this;
			return validator.bind(context)(value);
		};
	}
}
