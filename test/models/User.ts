import { Query } from 'mongoose';
import { Model, model, property, Ref } from '../../index';
import Post from './Post';

@model
export default class User extends Model {
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
