import { model, property, Query, TypedModel } from '../../';

@model
export class ValidateTest extends TypedModel {
	public static EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	@property({
		validate: [ValidateTest.validateEmail1, 'Uh oh, "{PATH}" invalid 1.']
	})
	public email1: string;
	@property({
		validate: [{
			validator: ValidateTest.validateEmail2_1,
			message: 'Uh oh, "{PATH}" invalid 2-1.'
		}, {
			validator: ValidateTest.validateEmail2_2,
			message: 'Uh oh, "{PATH}" invalid 2-2.'
		}]
	})
	public email2: string;
	@property({
		validate: ValidateTest.validateEmail3
	})
	public email3: string;
	@property({
		validate: {
			isAsync: true,
			validator: ValidateTest.validateEmail4,
			message: 'Uh oh, "{PATH}" invalid 4.'
		}
	})
	public email4: string;

	public static validateEmail1(value, object) {
		return ValidateTest.EMAIL_REGEX.test(value);
	}

	public static validateEmail2_1(value, object) {
		return value.length > 2;
	}

	public static validateEmail2_2(value, object) {
		return ValidateTest.EMAIL_REGEX.test(value);
	}

	public static validateEmail3(value, object) {
		return ValidateTest.EMAIL_REGEX.test(value);
	}

	public static validateEmail4(value, object, callback) {
		let result = ValidateTest.EMAIL_REGEX.test(value);
		callback(result, 'Overwriting error');
	}
}
