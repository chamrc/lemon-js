import { expect } from 'chai';
import { Permission, Post, User } from './models';

describe('Model relations', () => {
	beforeEach(async () => {
		const write = new Permission({
			name: 'write'
		});
		await write.save();

		const read = new Permission({
			name: 'read'
		});
		await read.save();

		const user = new User({
			age: 20,
			email: 'user1@example.com',
			name: 'User 1',
			permissions: [read._id, write._id]
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
		await Permission.remove();
		await User.remove();
		await Post.remove();
	});

	it('should allow to populate related model', async () => {
		const post = await Post.findByTitle('Post 1').populate('creator').exec();

		expect(post.title).to.be.equal('Post 1');
		expect(post.creator.displayName).to.be.equal('User 1 <user1@example.com>');
	});

	it('should allow to populate array of related models', async () => {
		const user = await User.findByEmail('user1@example.com').populate('permissions').exec();

		expect(user.name).to.be.equal('User 1');
		expect(user.permissions.length).to.be.equal(2);
		expect(user.permissions[0].name).to.be.equal('read');
		expect(user.permissions[1].name).to.be.equal('write');
	});
});
