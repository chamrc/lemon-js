import { Permission, Post } from '.';
import { model, property, Query, TypedModel } from '../../';

@model
export class User extends TypedModel {
	@property public age: number;
	@property public createdAt: Date;
	@property({ index: true }) public email: string;
	@property([{ refer: Permission }]) public permissions: [Permission];
	@property({ default: false }) public isActive: boolean;
	@property({ unique: true }) public name: string;

	public get displayName() {
		return `${ this.name } <${ this.email }>`;
	}

	public static findByEmail<T extends User>(email: string): Query<T> {
		return this.findOne({ email });
	}
}

@model
export class TypedUser extends User {
	@property({ default: 'user' }) public type: string;
}
