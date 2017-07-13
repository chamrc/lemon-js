## Installation

Install with [npm](https://npmjs.org/package/lemon-js):

    npm i -S lemon-js

## Usage

```typescript
import { Model, model, property } from 'lemon-js';

@model
export default class Post extends TypedModel {
	@property public title: string;
	@property public body: string;

	@property public creator: User;

	public static findByTitle(title: string): Query<Post> {
		return this.findOne({ title });
	}
}

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

const user = new User({
	age: 20,
	email: 'user1@example.com',
	name: 'User 1',
});
await user.save();

const post = new Post({
	body: 'Post body',
	creator: user._id,
	title: 'Post 1',
});
await post.save();

const post = await Post.findByTitle('Post 1').populate('creator').exec();
expect(post.title).to.be.equal('Post 1');
expect(post.creator.displayName).to.be.equal('User 1 <user1@example.com>');
```
## License

Licensed under MIT.

## Credits

Based on the work of @megahertz/mongoose-model