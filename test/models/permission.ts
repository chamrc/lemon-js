import { model, property, Query, Ref, TypedModel } from '../../';

@model
export class Permission extends TypedModel {
	@property public name: string;
}
