import { expect } from 'chai';
import { User } from './models';

const email = 'user1@example.com';

describe('Model', () => {
	beforeEach(() => {
		const user = new User({
			age: 20,
			email,
			name: 'User 1',
		});
		return user.save();
	});

	afterEach(() => {
		return User.remove();
	});

	it('should be successfully created', () => {
		const user = new User();
		expect(user instanceof User).to.be.true;
	});

	it('shouldn\'t find a not existed user', async () => {
		const user = await User.findById('51bb793aca2ab77a3200000d');
		expect(user).to.be.null;
	});

	it('should find an existed user', async () => {
		const user = await User.findByEmail(email);
		expect(user.name).to.be.equal('User 1');
	});

	it('should find an existed user with query', async () => {
		const users = await User.find<User[]>({ email }).limit(1);
		expect(users[0].displayName).to.be.equal(`User 1 <${email}>`);
	});
});
