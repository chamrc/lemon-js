declare function emit(k, v): void;

import { expect } from 'chai';
import { Types } from 'mongoose';
import { ModelMapReduceOption } from '../lib';
import { Post, TypedUser } from './models';

const email1 = 'user1@example.com';
const email2 = 'user2@abc.com';

describe('Model inheritance:', () => {
	beforeEach(async () => {
		const user = new TypedUser({
			age: 20,
			email: email1,
			name: 'User 1',
			type: 'admin'
		});
		await user.save();

		const user2 = new TypedUser({
			age: 25,
			email: email2,
			name: 'User 2'
		});
		await user2.save();
	});

	afterEach(async () => {
		await TypedUser.remove();
	});

	describe('General behaviour:', () => {
		it('should be successfully created', () => {
			const user = new TypedUser();
			expect(user instanceof TypedUser).to.be.true;
		});

		it('should not allow to add user with duplicated key', async () => {
			return new Promise(async (resolve, reject) => {
				try {
					// email should be the key
					const dupUser = new TypedUser({
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
					const dupUser = new TypedUser({
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
			const user = await TypedUser.findById('51bb793aca2ab77a3200000d');
			expect(user).to.be.null;
		});

		it('should find an existed user', async () => {
			const user = await TypedUser.findByEmail<TypedUser>(email1);
			expect(user.name).to.be.equal('User 1');
			expect(user.type).to.be.not.null;
			expect(user.type).to.be.equal('admin');

			const user2 = await TypedUser.findByEmail<TypedUser>(email2);
			expect(user2.name).to.be.equal('User 2');
			expect(user2.type).to.be.not.null;
			expect(user2.type).to.be.equal('user');
		});
	});
});
