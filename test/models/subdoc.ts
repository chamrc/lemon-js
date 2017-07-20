import { User } from '.';
import { model, property, Query, TypedModel } from '../../';

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
	owner: User;
	windows: IWindow[];
	computer: IComputer;
}

export interface IWindow {
	color: IColor;
	installer: User;
}

export interface IComputer {
	color: IColor;
	users: User[];
	system: string;
}

export interface IHouse {
	name: string;
	car: ICar;
	rooms: IRoom[];
}

@model
export class House extends TypedModel implements IHouse {
	@property({
		hidden: true
	})
	name: string;

	@property({
		subdoc: true,
		hidden: ['make'],
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
		subdoc: { autoIndex: false },
		hidden: ['owner'],
		name: String,
		color: {
			hidden: ['r'],
			r: Number,
			g: Number,
			b: Number
		},
		owner: { refer: User },
		windows: [{
			hidden: true,
			subdoc: true,
			installer: { ref: User }
		}],
		computer: {
			hidden: ['users'],
			subdoc: true,
			users: [{ ref: User }],
			system: String,
			color: {
				r: Number,
				g: Number,
				b: Number
			}
		}
	}])
	rooms: IRoom[];
}
