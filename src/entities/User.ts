import { Entity, Property } from '@mikro-orm/core';

@Entity({ abstract: true })
export abstract class User {
	@Property()
	public name!: string;

	@Property()
	public email!: string;

	@Property()
	public phone!: string;

	@Property({ type: 'double', unique: true })
	public vat!: number;

	@Property({ unique: true })
	public authId!: string;
}
