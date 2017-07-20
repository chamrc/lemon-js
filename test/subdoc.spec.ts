import { expect } from 'chai';
import { House, User } from './models';

describe('Sub-documents', () => {
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
				owner: wife._id,
				windows: [{
					installer: wife._id
				}],
				computer: {
					users: [wife._id, husband._id],
					system: 'macOS Sierra',
					color: {
						r: 255,
						g: 255,
						b: 255
					}
				}
			}, {
				name: 'bedroom 2',
				color: {
					r: 20,
					g: 20,
					b: 255
				},
				owner: husband._id,
				windows: [{
					installer: husband._id
				}],
				computer: {
					users: [wife._id, husband._id],
					system: 'Windows 10',
					color: {
						r: 0,
						g: 0,
						b: 0
					}
				}
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
		expect(house).to.be.not.undefined;
		expect(house.car).to.be.not.undefined;
		expect(house.car.make).to.be.equal('BMW');
		expect(house.car.color).to.be.not.undefined;
		expect(house.car.color.r).to.be.equal(255);
	});

	it('should save data in an array of sub-documents', async () => {
		const house: House = await House.findOne({ name: 'home' }) as House;
		expect(house).to.be.not.undefined;
		expect(house.rooms).to.be.not.undefined;
		expect(house.rooms.length).to.be.equal(2);
		expect(house.rooms[0].color).to.be.not.undefined;
		expect(house.rooms[0].color.g).to.be.equal(255);
		expect(house.rooms[1].color).to.be.not.undefined;
		expect(house.rooms[1].color.b).to.be.equal(255);
	});

	it('should allow to populate related model in sub-document', async () => {
		const house: House = await House.findOne({ name: 'home' }).populate('rooms.owner').exec() as House;
		expect(house).to.be.not.undefined;
		expect(house.rooms).to.be.not.undefined;
		expect(house.rooms.length).to.be.equal(2);
		expect(house.rooms[0].owner.document).to.be.not.undefined;
		expect(house.rooms[0].owner).to.be.not.undefined;
		expect(house.rooms[0].owner.name).to.be.equal('Wife');
		expect(house.rooms[1].owner.document).to.be.not.undefined;
		expect(house.rooms[1].owner).to.be.not.undefined;
		expect(house.rooms[1].owner.name).to.be.equal('Husband');
	});

	it('should allow to populate array of related models in sub-document', async () => {
		const house: House = await House.findOne({ name: 'home' }).populate('car.users').exec() as House;
		expect(house).to.be.not.undefined;
		expect(house.car).to.be.not.undefined;
		expect(house.car.users).to.be.not.undefined;
		expect(house.car.users.length).to.be.equal(2);
		expect(house.car.users[0].document).to.be.not.undefined;
		expect(house.car.users[0]).to.be.not.undefined;
		expect(house.car.users[0].name).to.be.equal('Wife');
		expect(house.car.users[1].document).to.be.not.undefined;
		expect(house.car.users[1]).to.be.not.undefined;
		expect(house.car.users[1].name).to.be.equal('Husband');
	});

	it('should allow to modify related model in sub-document', async () => {
		const house: House = await House.findOne({ name: 'home' }).populate('rooms.owner').exec() as House;
		expect(house).to.be.not.undefined;
		expect(house.rooms).to.be.not.undefined;
		expect(house.rooms.length).to.be.equal(2);
		expect(house.rooms[0].owner.document).to.be.not.undefined;
		expect(house.rooms[0].owner).to.be.not.undefined;
		expect(house.rooms[0].owner.name).to.be.equal('Wife');
		expect(house.rooms[1].owner.document).to.be.not.undefined;
		expect(house.rooms[1].owner).to.be.not.undefined;
		expect(house.rooms[1].owner.name).to.be.equal('Husband');

		let newName = 'Modified wife';
		house.rooms[0].owner.name = newName;
		await house.rooms[0].owner.save();
		expect(house.rooms[0].owner.name).to.be.equal(newName);

		const newHouse = await House.findOne({ name: 'home' }).populate('rooms.owner').exec() as House;
		expect(newHouse.rooms[0].owner.name).to.be.equal(newName);
	});

	it('should allow to modify array of related models in sub-document', async () => {
		const house: House = await House.findOne({ name: 'home' }).populate('car.users').exec() as House;
		expect(house).to.be.not.undefined;
		expect(house.car).to.be.not.undefined;
		expect(house.car.users).to.be.not.undefined;
		expect(house.car.users.length).to.be.equal(2);
		expect(house.car.users[0].document).to.be.not.undefined;
		expect(house.car.users[0]).to.be.not.undefined;
		expect(house.car.users[0].name).to.be.equal('Wife');
		expect(house.car.users[1].document).to.be.not.undefined;
		expect(house.car.users[1]).to.be.not.undefined;
		expect(house.car.users[1].name).to.be.equal('Husband');

		let newName = 'Modified wife';
		house.car.users[0].name = newName;
		await house.car.users[0].save();
		expect(house.car.users[0].name).to.be.equal(newName);

		const newHouse = await House.findOne({ name: 'home' }).populate('car.users').exec() as House;
		expect(newHouse.car.users[0].name).to.be.equal(newName);
	});

	it('should allow to populate in nested sub-document', async () => {
		const house: House = await House.findOne({ name: 'home' }).populate('rooms.windows.installer').exec() as House;
		expect(house).to.be.not.undefined;
		expect(house.rooms).to.be.not.undefined;
		expect(house.rooms.length).to.be.equal(2);
		expect(house.rooms[0].windows[0].installer.document).to.be.not.undefined;
		expect(house.rooms[0].windows[0].installer).to.be.not.undefined;
		expect(house.rooms[0].windows[0].installer.name).to.be.equal('Wife');
		expect(house.rooms[1].windows[0].installer.document).to.be.not.undefined;
		expect(house.rooms[1].windows[0].installer).to.be.not.undefined;
		expect(house.rooms[1].windows[0].installer.name).to.be.equal('Husband');
	});

	it('should allow to populate in nested sub-documents', async () => {
		const house: House = await House.findOne({ name: 'home' }).populate('rooms.computer.users').exec() as House;
		expect(house).to.be.not.undefined;
		expect(house.rooms).to.be.not.undefined;
		expect(house.rooms.length).to.be.equal(2);
		expect(house.rooms[0].computer.users[0].document).to.be.not.undefined;
		expect(house.rooms[0].computer.users[0]).to.be.not.undefined;
		expect(house.rooms[0].computer.users[0].name).to.be.equal('Wife');
		expect(house.rooms[0].computer.users[1].document).to.be.not.undefined;
		expect(house.rooms[0].computer.users[1]).to.be.not.undefined;
		expect(house.rooms[0].computer.users[1].name).to.be.equal('Husband');
	});

	it('should allow to modify in nested sub-document', async () => {
		const house: House = await House.findOne({ name: 'home' }).populate('rooms.windows.installer').exec() as House;
		expect(house).to.be.not.undefined;
		expect(house.rooms).to.be.not.undefined;
		expect(house.rooms.length).to.be.equal(2);
		expect(house.rooms[0].windows[0].installer.document).to.be.not.undefined;
		expect(house.rooms[0].windows[0].installer).to.be.not.undefined;
		expect(house.rooms[0].windows[0].installer.name).to.be.equal('Wife');
		expect(house.rooms[1].windows[0].installer.document).to.be.not.undefined;
		expect(house.rooms[1].windows[0].installer).to.be.not.undefined;
		expect(house.rooms[1].windows[0].installer.name).to.be.equal('Husband');

		let newName = 'Modified wife';
		house.rooms[0].windows[0].installer.name = newName;
		await house.rooms[0].windows[0].installer.save();
		expect(house.rooms[0].windows[0].installer.name).to.be.equal(newName);

		const newHouse = await House.findOne({ name: 'home' }).populate('rooms.windows.installer').exec() as House;
		expect(newHouse.rooms[0].windows[0].installer.name).to.be.equal(newName);
	});

	it('should allow to modify in nested sub-documents', async () => {
		const house: House = await House.findOne({ name: 'home' }).populate('rooms.computer.users').exec() as House;
		expect(house).to.be.not.undefined;
		expect(house.rooms).to.be.not.undefined;
		expect(house.rooms.length).to.be.equal(2);
		expect(house.rooms[0].computer.users[0].document).to.be.not.undefined;
		expect(house.rooms[0].computer.users[0]).to.be.not.undefined;
		expect(house.rooms[0].computer.users[0].name).to.be.equal('Wife');
		expect(house.rooms[0].computer.users[1].document).to.be.not.undefined;
		expect(house.rooms[0].computer.users[1]).to.be.not.undefined;
		expect(house.rooms[0].computer.users[1].name).to.be.equal('Husband');

		let newName = 'Modified wife';
		house.rooms[0].computer.users[0].name = newName;
		await house.rooms[0].computer.users[0].save();
		expect(house.rooms[0].computer.users[0].name).to.be.equal(newName);

		const newHouse = await House.findOne({ name: 'home' }).populate('rooms.computer.users').exec() as House;
		expect(newHouse.rooms[0].computer.users[0].name).to.be.equal(newName);
	});

	it('should hide fields in subdoc', async () => {
		const house: House = await House.findOne({ name: 'home' }).populate('rooms.computer').exec() as House;
		const json: any = house.toJSON();
		expect(json.name).to.be.undefined;
		expect(json.car.make).to.be.undefined;
		expect(json.rooms[0].color.r).to.be.undefined;
		expect(json.rooms[0].windows.length).to.be.equal(0);
		expect(json.rooms[0].computer.users).to.be.undefined;
	});

	it('should overwrite hiding fields in subdoc', async () => {
		const house: House = await House.findOne({ name: 'home' }).populate('rooms.computer').exec() as House;
		const json: any = house.toJSON({
			showHidden: true
		});
		expect(json.name).to.be.not.undefined;
		expect(json.car.make).to.be.not.undefined;
		expect(json.rooms[0].color.r).to.be.not.undefined;
		expect(json.rooms[0].windows.length).to.be.not.equal(0);
		expect(json.rooms[0].computer.users).to.be.not.undefined;
	});
});
