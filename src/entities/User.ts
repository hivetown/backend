import { Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import type { Image } from './Image';

@Entity()
export abstract class User {
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

	@OneToOne()
	public image?: Image;
}
