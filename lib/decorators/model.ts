import { model as mongooseModel, Schema } from 'mongoose';
import * as TimestampPlugin from 'mongoose-timestamp';
import * as pluralize from 'pluralize';
import { MethodSignature, SchemaTypeOptions } from '.';
import { deepExtend, deepMapKeys, deepMapValues, deepTraverse, getPath, isTypedModel, TypedModel } from '..';

export function model(constructor: typeof TypedModel);
export function model(options: object);
export function model(constructorOrOptions: typeof TypedModel | object) {
	if (typeof constructorOrOptions === 'function') {
		initializeModel(constructorOrOptions);
		return;
	}

	const options = constructorOrOptions;
	return (constructor: typeof TypedModel) => {
		initializeModel(constructor, options);
	};
}

function initializeModel(constructor: typeof TypedModel, options?: any) {
	const cls = constructor as any;
	const name: string = cls.name;
	let properties = cls._meta.properties as SchemaTypeOptions<any>;
	let rawProperties = cls._meta.rawProperties as SchemaTypeOptions<any>;

	// Initialize all properties;
	properties = Object.keys(properties).reduce((result, key) => {
		result[key] = initProp(key, properties[key], rawProperties[key], constructor);
		return result;
	}, {});

	if (options) {
		cls._meta.schemaOptions = options;
	}

	cls._schema = new Schema(properties, cls._meta.schemaOptions);
	cls._schema.plugin(TimestampPlugin);
	cls._schema['_meta'] = properties;
	cls._schema['_rawMeta'] = rawProperties;

	if (cls._schema && cls._sign) {
		(cls._sign as [MethodSignature]).forEach(methodSign => {
			/************************************************
			 *
			 * Push validators from method to
			 * validators from properties
			 *
			 ************************************************/
			let props = methodSign.validate.properties;
			props.forEach(path => {
				let propConfig = cls._schema.path(path);
				if (propConfig && propConfig.validators) {
					propConfig.validators.push({
						type: 'user defined',
						message: methodSign.validate.message,
						isAsync: methodSign.validate.validator.length === 2,
						validator: methodSign.validate.validator
					});
				}
			});

			/************************************************
			 *
			 * Add middlewares to pre and post hooks
			 *
			 ************************************************/
			let mids = methodSign.middlewares;
			let types = ['pre', 'post'];
			types.forEach(type => {
				let paths = mids[type];
				paths.forEach(path => {
					cls._schema[type](path, mids.function);
				});
			});
		});
	}

	cls.initSchema();
	cls._model = mongooseModel(name, cls._schema, pluralize(name.toLowerCase()));
}

function initProp<T>(name: string, options: SchemaTypeOptions<T>, rawOptions: SchemaTypeOptions<T>, constructor: typeof TypedModel) {
	createAccessors<T>(name, options, rawOptions, constructor);

	return options;
}

function isSubdocument(value) {
	return Boolean(value && value._doc && value.constructor && value.constructor.name &&
		(value.constructor.name === 'SingleNested' || value.constructor.name === 'EmbeddedDocument'));
}

function addAccessor(val) {
	if (val._travesed) return;

	let schema = val.schema;
	let meta = schema._meta ? schema._meta : undefined;
	let rawMeta = schema._rawMeta ? schema._rawMeta : undefined;

	if (meta && rawMeta && !Array.isArray(meta)) {
		Object.keys(meta).forEach((key, idx, arr) => {
			createAccessors(key, meta[key], rawMeta[key], val.constructor);
		});

		val._travesed = true;
	}
}

function createAccessors<T>(name: string, options: SchemaTypeOptions<T>, rawOptions: SchemaTypeOptions<T>, constructor) {
	Object.defineProperty(constructor.prototype, name, {
		configurable: true,
		enumerable: true,
		get() {
			const doc = this._document || this._doc;
			let value = doc ? doc[name] : undefined;

			// Find TypedModel constructor in result.
			let SavedTypedModel;
			if (value && rawOptions.ref && isTypedModel(rawOptions.ref)) {
				SavedTypedModel = rawOptions.ref;
			} else if (value && Array.isArray(rawOptions) && rawOptions.length === 1 && isTypedModel(rawOptions[0].ref)) {
				SavedTypedModel = rawOptions[0].ref;
			}

			// Sub-document support
			if (isSubdocument(value)) {
				addAccessor(value);
			} else if (Array.isArray(value) && value.length > 0 && isSubdocument(value[0])) {
				value.map(addAccessor);
			}

			if (value && SavedTypedModel) {
				if (Array.isArray(value)) {
					return value.map(r => {
						return new SavedTypedModel(r);
					});
				} else {
					return new SavedTypedModel(value);
				}
			}

			return value;
		},
		set(value: any) {
			let doc = this._document || this._doc;
			if (!doc) return;
			doc[name] = value;
		},
	});
}
