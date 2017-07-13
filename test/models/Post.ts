import { Query } from 'mongoose';
import { model, property, Ref, TypedModel } from '../../';
import User from './User';

@model
export default class Post extends TypedModel {
	@property public title: string;
	@property public body: string;

	@property public creator: User;

	public static findByTitle(title: string): Query<Post> {
		return this.findOne({ title });
	}
}
