import { model as mongooseModel, Schema } from 'mongoose';
import * as pluralize from 'pluralize';
import { TypedModel } from '../model';

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
	let properties = cls._meta.properties;

	if (options) {
		cls._meta.schemaOptions = options;
	}

	properties = Object.keys(properties).reduce((result, key) => {
		result[key] = initProp(key, properties[key], constructor);
		return result;
	}, {});

	cls._schema = new Schema(properties, cls._meta.schemaOptions);
	cls.initSchema();
	cls._model = mongooseModel(name, cls._schema, pluralize(name.toLowerCase()));
}

function initProp(name: string, options: any, constructor: typeof TypedModel) {
	const result = { ...options };

	if (options.ref) {
		result.ref = options.ref.name;

		if (!options.type) {
			result.type = Schema.Types.ObjectId;
		}
	}

	Object.defineProperty(constructor.prototype, name, {
		configurable: true,
		enumerable: true,
		get() {
			const doc = this._document;
			const value = doc ? doc[name] : undefined;

			if (options.ref && value) {
				return new options.ref(value);
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

	return result;
}
