import { Schema, SchemaTypeOpts } from 'mongoose';
import 'reflect-metadata';
import { TypedModel } from '../model';

export interface SchemaTypeOptions<T> extends SchemaTypeOpts<T> {
	// From lemon-js
	refer?: Constructor;
	ref?: Constructor;
}

export type Constructor = {
	new(...args): any
};

export type PropertyMetaType<T> = SchemaTypeOptions<T>
	| [any]
	| boolean
	| Boolean
	| Buffer
	| Date
	| number
	| Number
	| string
	| String
	| Schema.Types.Array
	| Schema.Types.Boolean
	| Schema.Types.Buffer
	| Schema.Types.Date
	| Schema.Types.Decimal128
	| Schema.Types.DocumentArray
	| Schema.Types.Embedded
	| Schema.Types.Mixed
	| Schema.Types.Number
	| Schema.Types.ObjectId
	| Schema.Types.String
	| any;

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
			properties: {},
			schemaOptions: {}
		};
	}

	const propsMeta: object = constructor._meta.properties;

	if (typeof meta === 'function') {
		propsMeta[propertyKey] = meta;
	} else if (!meta.type) {
		const type = Reflect.getMetadata('design:type', target, propertyKey);

		if (type) {
			meta.type = type;
		} else {
			const name = constructor.name;
			throw new Error(
				`Type of ${ name }.${ propertyKey } isn't set. Uf you use typescript ` +
				'you need to enable emitDecoratorMetadata in tsconfig.json',
			);
		}

		propsMeta[propertyKey] = meta;
	}
}
