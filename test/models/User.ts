import { Permission, Post } from '.';
import { model, property, Query, Ref, TypedModel } from '../../';

@model
export class User extends TypedModel {
	@property public age: number;
	@property public createdAt: Date;
	@property public email: string;
	@property({ reference: Permission, asArray: true }) public permissions: [Permission];
	@property({ default: false }) public isActive: boolean;
	@property public name: string;

	public get displayName() {
		return `${this.name} <${this.email}>`;
	}

	public static findByEmail(email: string): Query<User> {
		return this.findOne({ email });
	}
}
