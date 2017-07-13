import { expect } from 'chai';
import Post from './models/Post';
import User from './models/User';

describe('Model relations', () => {
	beforeEach(async () => {
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
	});

	afterEach(async () => {
		await User.remove();
		await Post.remove();
	});

	it('should allow to populate related models', async () => {
		const post = await Post.findByTitle('Post 1').populate('creator');
		expect(post.title).to.be.equal('Post 1');
		expect((post.creator as User).displayName)
			.to.be.equal('User 1 <user1@example.com>');
	});
});
