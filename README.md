[![Build Status](https://travis-ci.org/chamrc/lemon-js.svg?branch=master)](https://travis-ci.org/chamrc/lemon-js)
[![NPM version](https://badge.fury.io/js/lemon-js.svg)](https://badge.fury.io/js/lemon-js)
[![Dependencies status](https://david-dm.org/chamrc/lemon-js/status.svg)](https://david-dm.org/chamrc/lemon-js)
[![Coverage Status](https://coveralls.io/repos/github/chamrc/lemon-js/badge.svg?branch=master)](https://coveralls.io/github/chamrc/lemon-js?branch=master)

## Installation

Install with [npm](https://npmjs.org/package/lemon-js):

    npm i -S lemon-js

## Usage

### Define models

```typescript
import { Model, model, property } from 'lemon-js';

@model
export class Permission extends TypedModel {
	@property public name: string;
}

@model
export class User extends TypedModel {
	@property public age: number;
	@property public createdAt: Date;
	@property({ index: true }) public email: string;
	// Use either ref or refer.
	@property([{ refer: Permission }]) public permissions: [Permission];
	@property({ default: false }) public isActive: boolean;
	@property({ unique: true }) public name: string;

	public get displayName() {
		return `${ this.name } <${ this.email }>`;
	}

	public static findByEmail(email: string): Query<User> {
		return this.findOne({ email });
	}
}

@model
export class Post extends TypedModel {
	@property public title: string;
	@property public body: string;
	@property({ default: 0 }) public readCount: number;
	@property public creator: User;

	public static findByTitle(title: string): Query<Post> {
		return this.findOne({ title });
	}
}
```

### Insert objects
```typescript
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
```

### Retrieve objects
```typescript
const post = await Post.findByTitle('Post 1').populate('creator').exec();
expect(post.title).to.be.equal('Post 1');
expect(post.creator.displayName).to.be.equal('User 1 <user1@example.com>');

const user = await User.findByEmail('user1@example.com').populate('permissions').exec();
expect(user.name).to.be.equal('User 1');
expect(user.permissions.length).to.be.equal(2);
expect(user.permissions[0].name).to.be.equal('read');
expect(user.permissions[1].name).to.be.equal('write');
```

### Sub-document

#### Model
```typescript
export interface IColor {
	r: number;
	g: number;
	b: number;
}

export interface ICar {
	make: string;
	model: string;
	color: IColor;
	users?: User[];
}

export interface IRoom {
	color: IColor;
	name: string;
	owner?: User;
}

export interface IHouse {
	name: string;
	car: ICar;
	rooms: IRoom[];
}

@model
export class House extends TypedModel implements IHouse {
	@property name: string;
	@property({
		subdoc: true,
		make: String,
		model: String,
		color: {
			r: Number,
			g: Number,
			b: Number
		},
		users: [{ ref: User }]
	})
	car: ICar;
	@property([{
		subdoc: true,
		name: String,
		color: {
			r: Number,
			g: Number,
			b: Number
		},
		owner: { refer: User }
	}])
	rooms: IRoom[];
}
```

#### Insert a sub-document
```typescript
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
```

#### Populate a subdocument
```typescript
const house: House = await House.findOne({ name: 'home' }).populate('rooms.owner').exec() as House;
const house: House = await House.findOne({ name: 'home' }).populate('car.users').exec() as House;
```

### Middlewares (pre & post hooks)
```typescript
@method({
	pre: ['save'],
	post: ['remove']
})
public preSavePostRemove() {
}
```

### Validations
```typescript
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
		// Object is mapped to object
		return ValidateTest.EMAIL_REGEX.test(value);
	}

	public static validateEmail2_1(value, object) {
		// Object is mapped to object
		return value.length > 2;
	}

	public static validateEmail2_2(value, object) {
		// Object is mapped to object
		return ValidateTest.EMAIL_REGEX.test(value);
	}

	public static validateEmail3(value, object) {
		// Object is mapped to object
		return ValidateTest.EMAIL_REGEX.test(value);
	}

	public static validateEmail4(value, object, callback) {
		// Object is mapped to object
		// Support mongoose isAsync callback
		let result = ValidateTest.EMAIL_REGEX.test(value);
		callback(result, 'Overwriting error');
	}

	@method<ValidateTest>({
		validate: ['email2', 'email3'],
		message: 'Validating for both email2 and email3'
	})
	public validateEmail2AndEmail3(value, callback) {
		let result = ValidateTest.EMAIL_REGEX.test(value);
		callback(result, 'Overwriting error');
	}
}
```

## License

Licensed under MIT.

## Credits

Based on the work of @megahertz/mongoose-model