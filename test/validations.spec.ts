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

	it('should validate using {validate: [{validator, message}]}', async () => {
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

	it('should validate using {validate: validator}', async () => {
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

	it('should validate using {validate: {isAsync, validator, message}}', async () => {
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
});
