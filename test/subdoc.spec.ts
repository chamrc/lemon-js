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
		const house: House = await House.findOne({ name: 'home' }) as House;
		expect(house).to.be.not.null;
		expect(house.car).to.be.not.null;
		expect(house.car.make).to.be.equal('BMW');
		expect(house.car.color).to.be.not.null;
		expect(house.car.color.r).to.be.equal(255);
	});

	it('should save data in an array of sub-documents', async () => {
		const house: House = await House.findOne({ name: 'home' }) as House;
		expect(house).to.be.not.null;
		expect(house.rooms).to.be.not.null;
		expect(house.rooms.length).to.be.equal(2);
		expect(house.rooms[0].color).to.be.not.null;
		expect(house.rooms[0].color.g).to.be.equal(255);
		expect(house.rooms[1].color).to.be.not.null;
		expect(house.rooms[1].color.b).to.be.equal(255);
	});

	it('should allow to populate related model in sub-document', async () => {
		const house: House = await House.findOne({ name: 'home' }).populate('rooms.owner').exec() as House;

		expect(house).to.be.not.null;
		expect(house.rooms).to.be.not.null;
		expect(house.rooms.length).to.be.equal(2);
		expect(house.rooms[0].owner.document).to.be.not.null;
		expect(house.rooms[0].owner).to.be.not.null;
		expect(house.rooms[0].owner.name).to.be.equal('Wife');
		expect(house.rooms[1].owner.document).to.be.not.null;
		expect(house.rooms[1].owner).to.be.not.null;
		expect(house.rooms[1].owner.name).to.be.equal('Husband');
	});

	it('should allow to populate array of related models in sub-document', async () => {
		const house: House = await House.findOne({ name: 'home' }).populate('car.users').exec() as House;
		expect(house).to.be.not.null;
		expect(house.car).to.be.not.null;
		expect(house.car.users).to.be.not.null;
		expect(house.car.users.length).to.be.equal(2);
		expect(house.car.users[0].document).to.be.not.null;
		expect(house.car.users[0]).to.be.not.null;
		expect(house.car.users[0].name).to.be.equal('Wife');
		expect(house.car.users[1].document).to.be.not.null;
		expect(house.car.users[1]).to.be.not.null;
		expect(house.car.users[1].name).to.be.equal('Husband');
	});
});
