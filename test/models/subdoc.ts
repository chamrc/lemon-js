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
