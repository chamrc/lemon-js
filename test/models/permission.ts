import { model, property, Query, TypedModel } from '../../';

@model
export class Permission extends TypedModel {
	@property public name: string;
}
