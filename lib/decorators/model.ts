import { model as mongooseModel, Schema } from 'mongoose';
import * as pluralize from 'pluralize';
import { SchemaTypeOptions } from '.';
import { deepMapKeys, deepMapValues, isTypedModel, TypedModel } from '..';

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

	if (options) {
		cls._meta.schemaOptions = options;
	}

	properties = Object.keys(properties).reduce((result, key) => {
		result[key] = initProp(key, properties[key], rawProperties[key], constructor);
		return result;
	}, {});

	cls._schema = new Schema(properties, cls._meta.schemaOptions);
	cls.initSchema();
	cls._model = mongooseModel(name, cls._schema, pluralize(name.toLowerCase()));
}

function initProp<T>(name: string, options: SchemaTypeOptions<T>, rawOptions: SchemaTypeOptions<T>, constructor: typeof TypedModel) {
	Object.defineProperty(constructor.prototype, name, {
		configurable: true,
		enumerable: true,
		get() {
			const doc = this._document;
			const value = doc ? doc[name] : undefined;
			// TODO: support subdoc

			let SavedTypedModel;
			if (value && rawOptions.ref && isTypedModel(rawOptions.ref)) {
				SavedTypedModel = rawOptions.ref;
			} else if (value && Array.isArray(rawOptions) && rawOptions.length === 1 && isTypedModel(rawOptions[0])) {
				SavedTypedModel = rawOptions[0].ref;
			}

			if (value && SavedTypedModel) {
				if (Array.isArray(value)) {
					return value.map(r => new SavedTypedModel(r));
				} else {
					return new SavedTypedModel(value);
				}
			}

			return value;
		},
		set(value: any) {
			if (!this._document) {
				return;
			}

			this._document[name] = value;
		},
	});

	return options;
}
