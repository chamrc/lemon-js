import { model, property, Query, Ref, TypedModel } from '../../';
import { User } from './user';

@model
export class Post extends TypedModel {
	@property public title: string;
	@property public body: string;
	@property({ reference: User }) public creator: User;

	public static findByTitle(title: string): Query<Post> {
		return this.findOne({ title });
	}
}
