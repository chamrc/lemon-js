import { Query } from 'mongoose';
import { Model, model, property, Ref } from '../../index';
import User from './User';

@model
export default class Post extends Model {
	@property public title: string;
	@property public body: string;

	@property({ ref: User })
	public creator: Ref<User>;

	public static findByTitle(title: string): Promise<Post> {
		return this.findOne({ title });
	}
}
