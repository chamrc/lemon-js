
declare function emit(k, v): void;

import { expect } from 'chai';
import { Types } from 'mongoose';
import { ModelMapReduceOption } from '../lib';
import { Post, User } from './models';

const email1 = 'user1@example.com';
const email2 = 'user2@abc.com';

describe('Model:', () => {
	beforeEach(async () => {
		const user = new User({
			age: 20,
			email: email1,
			name: 'User 1',
		});
		await user.save();

		const user2 = new User({
			age: 25,
			email: email2,
			name: 'User 2'
		});
		await user2.save();
	});

	afterEach(async () => {
		await User.remove();
	});

	describe('General behaviour:', () => {
		it('should be successfully created', () => {
			const user = new User();
			expect(user instanceof User).to.be.true;
		});

		it('should not allow to add user with duplicated key', async () => {
			return new Promise(async (resolve, reject) => {
				try {
					// email should be the key
					const dupUser = new User({
						name: 'User 1',
						email: email1,
						age: 20
					});
					await dupUser.save();
				} catch (error) {
					resolve();
				}
			});
		});

		it('should not allow to add user with duplicated unique attribute', async () => {
			return new Promise(async (resolve, reject) => {
				try {
					// name should be unique
					const dupUser = new User({
						name: 'User 1',
						email: 'another.email1@email1.com',
						age: 20
					});
					await dupUser.save();
				} catch (error) {
					resolve();
				}
			});
		});

		it('shouldn\'t find a not existed user', async () => {
			const user = await User.findById('51bb793aca2ab77a3200000d');
			expect(user).to.be.null;
		});

		it('should find an existed user', async () => {
			const user = await User.findByEmail(email1);
			expect(user.name).to.be.equal('User 1');
		});
	});

	describe('Accessors:', () => {
		it('public get document()', async () => {
			const user = await User.findByEmail(email1);
			expect(user.document).to.be.not.undefined;
		});

		it('public get _id()', async () => {
			const user = await User.findByEmail(email1);
			expect(user._id).to.be.not.undefined;
		});

		it('public set _id()', async () => {
			const user = await User.findByEmail(email1);
			const oldId = user._id;
			expect(user._id).to.be.not.undefined;
			const newId = new Types.ObjectId('51bb793aca2ab77a3200000d');
			user._id = newId;
			expect(user._id).to.be.not.equal(oldId);
		});

		it('public get __v()', async () => {
			const user = await User.findByEmail(email1);
			expect(user.__v).to.be.not.undefined;
		});

		it('public set __v()', async () => {
			const user = await User.findByEmail(email1);
			const oldV = user.__v;
			expect(user.__v).to.be.not.undefined;
			user.__v = 22312312;
			expect(user.__v).to.be.not.equal(oldV);
		});

		it('public get id()', async () => {
			const user = await User.findByEmail(email1);
			expect(user.id).to.be.not.undefined;
		});

		it('public get isNew()', async () => {
			const user = await User.findByEmail(email1);
			expect(user.isNew).to.be.false;
		});

		it('public get createdAt()', async () => {
			const user = await User.findByEmail(email1);
			expect(user.createdAt).to.be.not.undefined;
		});

		it('public set createdAt()', async () => {
			const user = await User.findByEmail(email1);
			const oldCreatedAt = user.createdAt;
			user.createdAt = new Date();
			expect(user.createdAt).to.be.not.equal(oldCreatedAt);
		});

		it('public get updatedAt()', async () => {
			const user = await User.findByEmail(email1);
			expect(user.updatedAt).to.be.not.undefined;
		});

		it('public set updatedAt()', async () => {
			const user = await User.findByEmail(email1);
			const oldUpdatedAt = user.updatedAt;
			user.updatedAt = new Date();
			expect(user.updatedAt).to.be.not.equal(oldUpdatedAt);
		});
	});

	describe('Static methods:', () => {
		it('public static getModel()', async () => {
			expect(User.getModel()).to.be.not.undefined;
		});

		it('public static getSchema()', async () => {
			expect(User.getSchema()).to.be.not.undefined;
		});

		it('public static remove()', async () => {
			let user = await User.findByEmail(email1);
			expect(user.isNew).to.be.not.undefined;
			User.remove();
			user = await User.findByEmail(email1);
			expect(user.isNew).to.be.false;
		});

		it('public static find()', async () => {
			const users = await User.find<User[]>({ email: email1 }).limit(1);
			expect(users.length).to.be.equal(1);
			expect(users[0].displayName).to.be.equal(`User 1 <${ email1 }>`);
		});

		it('public static findOne()', async () => {
			const user = await User.findOne<User>({ email: email1 }).limit(1);
			expect(user).to.not.be.null;
			expect(user._id).to.not.be.null;
			expect(user.displayName).to.be.equal(`User 1 <${ email1 }>`);
		});

		it('public static findById()', async () => {
			const refUser = await User.findOne<User>({ email: email1 }).limit(1);
			expect(refUser).to.not.be.null;
			expect(refUser._id).to.not.be.null;
			const user = await User.findById<User>(refUser._id);
			expect(user.displayName).to.be.equal(`User 1 <${ email1 }>`);
		});

		it('public static count()', async () => {
			const users = await User.find<User[]>({});
			expect(users.length).to.be.equal(2);
			expect(users[0].displayName).to.be.equal(`User 1 <${ email1 }>`);
			expect(users[1].name).to.be.equal('User 2');
		});

		it('public static distinct()', async () => {
			const olderThan18 = await User.distinct('email', { age: { $gt: 18 } }).exec();
			expect(olderThan18.length).to.be.equal(2);
			const olderThan22 = await User.distinct('email', { age: { $gt: 22 } }).exec();
			expect(olderThan22.length).to.be.equal(1);
		});

		it('public static where()', async () => {
			const users = await User.where<User[]>('age').gte(21).lte(65).exec();
			expect(users.length).to.be.equal(1);
			expect(users[0].name).to.be.equal('User 2');
		});

		it('public static $where()', async () => {
			const users = await User.$where<User[]>('this.age >= 21 && this.age <= 65').exec();
			expect(users.length).to.be.equal(1);
			expect(users[0].name).to.be.equal('User 2');
		});

		it('public static findOneAndUpAt()', async () => {
			const newEmail = '123@321.com';
			const user = await User.findOneAndUpdate<User>({ email: email1 }, { email: newEmail }, { new: true }).exec();
			expect(user).to.not.be.null;
			expect(user.email).to.be.equal(newEmail);

			const users = await User.find<User[]>({});
			expect(users.length).to.be.equal(2);
			expect(users[0].displayName).to.be.equal(`User 1 <${ newEmail }>`);
			expect(users[1].name).to.be.equal('User 2');
		});

		it('public static findByIdAndUpAt()', async () => {
			const refUser = await User.findOne<User>({ email: email1 }).limit(1);
			expect(refUser).to.not.be.null;
			expect(refUser._id).to.not.be.null;

			const newEmail = '123@321.com';
			const user = await User.findByIdAndUpdate<User>(refUser._id, { email: newEmail }, { new: true }).exec();
			expect(user).to.not.be.null;
			expect(user.email).to.be.equal(newEmail);

			const users = await User.find<User[]>({});
			expect(users.length).to.be.equal(2);
			expect(users[0].displayName).to.be.equal(`User 1 <${ newEmail }>`);
			expect(users[1].name).to.be.equal('User 2');
		});

		it('public static findOneAndRemove()', async () => {
			const user = await User.findOneAndRemove<User>({ email: email1 }).exec();
			expect(user).to.not.be.null;
			expect(user.email).to.be.equal(email1);

			const users = await User.find<User[]>({});
			expect(users.length).to.be.equal(1);
			expect(users[0].name).to.be.equal('User 2');
		});

		it('public static findByIdAndRemove()', async () => {
			const refUser = await User.findOne<User>({ email: email1 }).limit(1);
			expect(refUser).to.not.be.null;
			expect(refUser._id).to.not.be.null;

			const user = await User.findByIdAndRemove<User>(refUser._id).exec();
			expect(user).to.not.be.null;
			expect(user.email).to.be.equal(email1);

			const users = await User.find<User[]>({});
			expect(users.length).to.be.equal(1);
			expect(users[0].name).to.be.equal('User 2');
		});

		it('public static async create()', async () => {
			const email3 = '3@123.com';
			const email5 = '5@5125.com';
			const newUsers = await User.create<User>([{
				age: 25,
				email: email3,
				name: 'User 3'
			}, {
				age: 25,
				email: email5,
				name: 'User 5'
			}]);
			expect(newUsers.length).to.be.equal(2);

			const users = await User.find<User[]>({});
			expect(users.length).to.be.equal(4);
			expect(users[0].displayName).to.be.equal(`User 1 <${ email1 }>`);
			expect(users[1].name).to.be.equal('User 2');
			expect(users[2].displayName).to.be.equal(`User 3 <${ email3 }>`);
			expect(users[3].name).to.be.equal('User 5');
		});

		it('public static async insertMany()', async () => {
			const email3 = '3@123.com';
			const email5 = '5@5125.com';
			const newUsers = await User.insertMany<User>([{
				age: 25,
				email: email3,
				name: 'User 3'
			}, {
				age: 25,
				email: email5,
				name: 'User 5'
			}]);
			expect(newUsers.length).to.be.equal(2);

			const users = await User.find<User[]>({});
			expect(users.length).to.be.equal(4);
			expect(users[0].displayName).to.be.equal(`User 1 <${ email1 }>`);
			expect(users[1].name).to.be.equal('User 2');
			expect(users[2].displayName).to.be.equal(`User 3 <${ email3 }>`);
			expect(users[3].name).to.be.equal('User 5');
		});

		it('public static hydrate()', async () => {
			const userId = '54108337212ffb6d459f854c';
			const email3 = '3@123.com';
			const user = await User.hydrate<User>({
				_id: userId,
				age: 25,
				email: email3,
				name: 'User 3'
			});
			expect(user.displayName).to.be.equal(`User 3 <${ email3 }>`);
			expect(user._id.toString()).to.be.equal(userId);

			const users = await User.find<User[]>({});
			expect(users.length).to.be.equal(2);
			expect(users[0].displayName).to.be.equal(`User 1 <${ email1 }>`);
			expect(users[1].name).to.be.equal('User 2');
		});

		it('public static upAt()', async () => {
			let users = await User.find<User[]>({});
			expect(users.length).to.be.equal(2);
			expect(users[0].displayName).to.be.equal(`User 1 <${ email1 }>`);
			expect(users[0].isActive).to.be.false;
			expect(users[1].name).to.be.equal('User 2');
			expect(users[1].isActive).to.be.false;
			await User.update({ email: email1 }, { isActive: true });
			users = await User.find<User[]>({});
			expect(users.length).to.be.equal(2);
			expect(users[0].displayName).to.be.equal(`User 1 <${ email1 }>`);
			expect(users[0].isActive).to.be.true;
			expect(users[1].name).to.be.equal('User 2');
			expect(users[1].isActive).to.be.false;
		});

		it('public static updateMany()', async () => {
			let users = await User.find<User[]>({});
			expect(users.length).to.be.equal(2);
			expect(users[0].displayName).to.be.equal(`User 1 <${ email1 }>`);
			expect(users[0].isActive).to.be.false;
			expect(users[1].name).to.be.equal('User 2');
			expect(users[1].isActive).to.be.false;

			await User.updateMany({ isActive: false }, { isActive: true });

			users = await User.find<User[]>({});
			expect(users.length).to.be.equal(2);
			expect(users[0].displayName).to.be.equal(`User 1 <${ email1 }>`);
			expect(users[0].isActive).to.be.true;
			expect(users[1].name).to.be.equal('User 2');
			expect(users[1].isActive).to.be.true;
		});

		it('public static updateOne()', async () => {
			let users = await User.find<User[]>({});
			expect(users.length).to.be.equal(2);
			expect(users[0].displayName).to.be.equal(`User 1 <${ email1 }>`);
			expect(users[0].isActive).to.be.false;
			expect(users[1].name).to.be.equal('User 2');
			expect(users[1].isActive).to.be.false;

			await User.updateOne({ isActive: false }, { isActive: true });

			users = await User.find<User[]>({});
			expect(users.length).to.be.equal(2);
			expect(users[0].displayName).to.be.equal(`User 1 <${ email1 }>`);
			expect(users[0].isActive).to.be.true;
			expect(users[1].name).to.be.equal('User 2');
			expect(users[1].isActive).to.be.false;
		});

		it('public static replaceOne()', async () => {
			let users = await User.find<User[]>({});
			expect(users.length).to.be.equal(2);
			expect(users[0].displayName).to.be.equal(`User 1 <${ email1 }>`);
			expect(users[0].isActive).to.be.false;
			expect(users[1].name).to.be.equal('User 2');
			expect(users[1].isActive).to.be.false;

			const email3 = '3@123.com';
			await User.replaceOne({ isActive: false }, {
				name: 'User 3',
				email: email3,
				age: 20
			});

			users = await User.find<User[]>({});
			expect(users.length).to.be.equal(2);
			expect(users[0].displayName).to.be.equal(`User 3 <${ email3 }>`);
			expect(users[1].name).to.be.equal('User 2');
		});

		it('public static mapReduce()', async () => {
			const users = await User.find<User[]>({});

			const post1 = await new Post({
				title: 'post',
				body: 'body 1',
				readCount: 25,
				creator: users[0]._id
			}).save();
			const post2 = await new Post({
				title: 'post',
				body: 'body 2',
				readCount: 35,
				creator: users[0]._id
			}).save();
			const post3 = await new Post({
				title: 'post 3',
				body: 'body 3',
				readCount: 500,
				creator: users[1]._id
			}).save();

			const map = function () { emit(this.title, 1); };
			const reduce = function (key, values) { return values.reduce((a, b) => a + b, 0); };
			const mapReduce = {
				map: map,
				reduce: reduce
			};
			const results = await Post.mapReduce<string, number>(mapReduce);
			expect(results.length).to.be.equal(2);
			expect(results[0].value).to.be.equal(2);
			expect(results[1].value).to.be.equal(1);

			await Post.remove();
		});

		it('public static mapReduce() using relationship', async () => {
			const users = await User.find<User[]>({});

			const post1 = await new Post({
				title: 'post',
				body: 'body 1',
				readCount: 25,
				creator: users[0]._id
			}).save();
			const post2 = await new Post({
				title: 'post',
				body: 'body 2',
				readCount: 35,
				creator: users[0]._id
			}).save();
			const post3 = await new Post({
				title: 'post 3',
				body: 'body 3',
				readCount: 500,
				creator: users[1]._id
			}).save();

			const map = function () { emit(this.creator, this.readCount); };
			const reduce = function (key, values) { return values.reduce((a, b) => a + b, 0); };
			const mapReduce = {
				map: map,
				reduce: reduce
			};
			const results = await Post.mapReduce<string, number>(mapReduce);
			expect(results.length).to.be.equal(2);
			expect(results[0].value).to.be.equal(60);
			expect(results[1].value).to.be.equal(500);

			await Post.remove();
		});

		// it.skip('public static mapReduce() using string', async () => {
		// 	const users = await User.find<User[]>({});

		// 	const post1 = await new Post({
		// 		title: 'post',
		// 		body: 'body 1',
		// 		readCount: 25,
		// 		creator: users[0]._id
		// 	}).save();
		// 	const post2 = await new Post({
		// 		title: 'post',
		// 		body: 'body 2',
		// 		readCount: 35,
		// 		creator: users[0]._id
		// 	}).save();
		// 	const post3 = await new Post({
		// 		title: 'post 3',
		// 		body: 'body 3',
		// 		readCount: 500,
		// 		creator: users[1]._id
		// 	}).save();

		// 	const mapReduce: any = {
		// 		map: `function() { emit(this.title, 1); }`,
		// 		reduce: `function(key, values) { return values.reduce((a, b) => a + b, 0) }`
		// 	};
		// 	const results = await Post.mapReduce<string, number>(mapReduce);
		// 	expect(results.length).to.be.equal(2);
		// 	expect(results[0].value).to.be.equal(2);
		// 	expect(results[1].value).to.be.equal(1);

		// 	await Post.remove();
		// });

		it.skip('public static geoNear()', async () => {

		});

		it.skip('public static aggregate()', async () => {

		});

		it.skip('public static geoSearch()', async () => {

		});
	});

	describe('Instance methods:', () => {
		it.skip('public $isDefault()', async () => {

		});

		it.skip('public depopulate()', async () => {

		});

		it.skip('public equals()', async () => {

		});

		it.skip('public async execPopulate()', async () => {

		});

		it.skip('public get()', async () => {

		});

		it.skip('public init()', async () => {

		});

		it.skip('public inspect()', async () => {

		});

		it.skip('public invaliAt()', async () => {

		});

		it.skip('public isDirectModified()', async () => {

		});

		it.skip('public isInit()', async () => {

		});

		it.skip('public isModified()', async () => {

		});

		it.skip('public isSelected()', async () => {

		});

		it.skip('public markModified()', async () => {

		});

		it.skip('public modifiedPaths()', async () => {

		});

		it.skip('public populate()', async () => {

		});

		it.skip('public populated()', async () => {

		});

		it.skip('public toJSON()', async () => {

		});

		it.skip('public toObject()', async () => {

		});

		it.skip('public toString()', async () => {

		});

		it.skip('public unmarkModified()', async () => {

		});

		it.skip('public valiAt()', async () => {

		});

		it.skip('public validateSync()', async () => {

		});

		it.skip('public async save()', async () => {

		});

		it.skip('public increment()', async () => {

		});

		it.skip('public remove()', async () => {

		});

		it.skip('public async upAt()', async () => {

		});

		it.skip('public set()', async () => {

		});
	});
});
