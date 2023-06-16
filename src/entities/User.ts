import { Entity, Enum, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import type { Image } from './Image';
import type { UserType } from '../enums';
import type { Role } from './Role';

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

	// Role based access control
	@ManyToOne({ nullable: true })
	public role?: Role;

	@Enum()
	public type!: UserType;

	@Property()
	public disableEmails = false;

	@OneToOne({ eager: true })
	public image?: Image;
}
