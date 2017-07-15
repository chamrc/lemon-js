import { model, property, Query, TypedModel } from '../../';
import { User } from './user';

@model
export class Post extends TypedModel {
	@property public title: string;
	@property public body: string;
	@property({ default: 0 }) public readCount: number;
	@property public creator: User;

	public static findByTitle(title: string): Query<Post> {
		return this.findOne({ title });
	}
}
