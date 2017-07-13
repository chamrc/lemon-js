import { model as mongooseModel, Schema } from 'mongoose';
import * as pluralize from 'pluralize';
import { PropertyMetaType } from '.';
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
	let properties = cls._meta.properties as PropertyMetaType;

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

function initProp(name: string, options: PropertyMetaType, constructor: typeof TypedModel) {
	Object.defineProperty(constructor.prototype, name, {
		configurable: true,
		enumerable: true,
		get() {
			const doc = this._document;
			const value = doc ? doc[name] : undefined;

			if (options.reference && value) {
				if (options.asArray && Array.isArray(value)) {
					return value.map(r => new options.reference(r));
				} else {
					return new options.reference(value);
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

	const result: PropertyMetaType = { ...options };

	if (options.reference) {
		result.type = Schema.Types.ObjectId;
		result.ref = options.reference.name;
		delete result.reference;
		delete result.asArray;

		if (options.asArray) {
			return [result];
		}
	}

	return result;
}
