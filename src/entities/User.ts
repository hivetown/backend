import { Entity, Enum, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import type { Image } from './Image';
import type { UserType } from '../enums';

@Entity()
export class User {
	@PrimaryKey()
	public id!: number;

	@Property({ unique: true, hidden: true })
	public authId!: string;

	@Property()
	public name!: string;

	@Property()
	public email!: string;

	@Property({ type: 'string' })
	public phone!: string;

	@Property({ type: 'string' })
	public vat!: string;

	// bitmask permissions
	@Property({ type: 'number' })
	public permissions!: number;

	@Enum()
	public type!: UserType;

	@OneToOne({ eager: true })
	public image?: Image;
}
