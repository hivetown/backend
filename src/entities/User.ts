import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
import type { UserType } from '../types/enums';

@Entity()
export abstract class User {
	@PrimaryKey({ autoincrement: true })
	public id!: number;

	@Property()
	public name!: string;

	@Property()
	public email!: string;

	@Property()
	public phone!: number;

	@Property()
	public vat!: number;

	@Enum()
	public type!: UserType;
}
