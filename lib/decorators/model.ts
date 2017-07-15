import { model as mongooseModel, Schema } from 'mongoose';
import * as pluralize from 'pluralize';
import { SchemaTypeOptions } from '.';
import { deepMapKeys, deepMapValues, TypedModel } from '..';

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

	if (options) {
		cls._meta.schemaOptions = options;
	}

	properties = Object.keys(properties).reduce((result, key) => {
		result[key] = initProp(key, properties[key], constructor);
		return result;
	}, {});

	debugger;

	cls._schema = new Schema(properties, cls._meta.schemaOptions);
	cls.initSchema();
	cls._model = mongooseModel(name, cls._schema, pluralize(name.toLowerCase()));
}

function initProp<T>(name: string, options: SchemaTypeOptions<T>, constructor: typeof TypedModel) {
	Object.defineProperty(constructor.prototype, name, {
		configurable: true,
		enumerable: true,
		get() {
			const doc = this._document;
			const value = doc ? doc[name] : undefined;

			if (value && (options.refer || options.ref)) {
				let ValueType = options.ref ? options.ref : options.refer;
				if (Array.isArray(value)) {
					return value.map(r => new ValueType(r));
				} else {
					return new ValueType(value);
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

	debugger;
	let result: SchemaTypeOptions<T> = deepMapKeys(options, (val, key) => key === 'refer' ? 'ref' : key);
	debugger;
	result = deepMapValues(result, (val, key) => {
		if (key === 'ref') return val._meta && val.name ? val.name : val;
		else if (key === 'type') return val._meta && val.name ? Schema.Types.ObjectId : val;
		else return val;
	});
	debugger;

	return result;
}
