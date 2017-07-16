import { expect } from 'chai';
import { House, User } from './models';

describe('Model relations', () => {
	beforeEach(async () => {
		const wife = new User({
			age: 20,
			email: 'user1@example.com',
			name: 'Wife',
			permissions: []
		});
		await wife.save();

		const husband = new User({
			age: 25,
			email: 'user2@example.com',
			name: 'Husband',
			permissions: []
		});
		await husband.save();

		const house = new House({
			name: 'home',
			car: {
				make: 'BMW',
				model: '550i',
				color: {
					r: 255,
					g: 20,
					b: 20
				},
				users: [wife._id, husband._id]
			},
			rooms: [{
				name: 'bedroom 1',
				color: {
					r: 20,
					g: 255,
					b: 20
				},
				owner: wife._id
			}, {
				name: 'bedroom 2',
				color: {
					r: 20,
					g: 20,
					b: 255
				},
				owner: husband._id
			}]
		});
		await house.save();
	});

	afterEach(async () => {
		await User.remove();
		await House.remove();
	});

	it('should save data in a single sub-document', async () => {
		const house = await House.find({ name: 'home' });
		expect(house).to.be.not.null;
	});

	it.skip('should save data in an array of sub-documents', async () => {
		const house = await House.find({ name: 'home' });
		expect(house).to.be.not.null;
	});

	it.skip('should allow to populate related model in sub-document', async () => {
		const house = await House.find({ name: 'home' });
		expect(house).to.be.not.null;
	});

	it.skip('should allow to populate array of related models in sub-document', async () => {
		const house = await House.find({ name: 'home' });
		expect(house).to.be.not.null;
	});
});
