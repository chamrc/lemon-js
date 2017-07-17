import { expect } from 'chai';
import { ValidateTest } from './models';

describe('Model relations', () => {
	beforeEach(async () => {
	});

	afterEach(async () => {
		ValidateTest.remove();
	});

	it('should validate using {validate: [validator, message]}', async () => {
		return new Promise(async (resolve, reject) => {
			try {
				const test = new ValidateTest({
					email1: '123'
				});
				await test.save();
			} catch (error) {
				resolve();
			}
		});
	});

	it('should validate using { validate: [{ validator, message }] }', async () => {
		return new Promise(async (resolve, reject) => {
			try {
				const test = new ValidateTest({
					email2: '123'
				});
				await test.save();
			} catch (error) {
				resolve();
			}
		});
	});

	it('should validate using { validate: validator }', async () => {
		return new Promise(async (resolve, reject) => {
			try {
				const test = new ValidateTest({
					email3: '123'
				});
				await test.save();
			} catch (error) {
				resolve();
			}
		});
	});

	it('should validate using { validate: { validator, message } }', async () => {
		return new Promise(async (resolve, reject) => {
			try {
				const test = new ValidateTest({
					email4: '123'
				});
				await test.save();
			} catch (error) {
				resolve();
			}
		});
	});

	it('should validate using @method{ validate }', async () => {
		return new Promise(async (resolve, reject) => {
			try {
				const test = new ValidateTest({
					email2: '123'
				});
				await test.save();
			} catch (error) {
				try {
					const test = new ValidateTest({
						email4: '123'
					});
					await test.save();
				} catch (error) {
					resolve();
				}
			}
		});
	});

	it('should run pre-save hook', async () => {
		return new Promise(async (resolve, reject) => {
			const test = new ValidateTest({});
			await test.save();
			expect(test.email5).to.be.not.undefined;
			expect(test.email5).to.be.equal('123@321.com');
			resolve();
		});
	});
});
