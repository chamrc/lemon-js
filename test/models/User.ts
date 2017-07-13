import { Query } from 'mongoose';
import { model, property, Ref, TypedModel } from '../../lib';
import Post from './Post';

@model
export default class User extends TypedModel {
	@property public age: number;
	@property public createdAt: Date;
	@property public email: string;

	@property({ default: false })
	public isActive: boolean;

	@property public name: string;

	public get displayName() {
		return `${this.name} <${this.email}>`;
	}

	public static findByEmail(email: string): Promise<User> {
		return this.findOne({ email });
	}
}
