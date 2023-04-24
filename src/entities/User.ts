import { Entity, Property } from '@mikro-orm/core';

@Entity({ abstract: true })
export abstract class User {
	@Property()
	public name!: string;

	@Property()
	public email!: string;

	@Property({ type: 'string' })
	public phone!: string;

	@Property({ type: 'string', unique: true })
	public vat!: string;

	@Property({ unique: true, hidden: true })
	public authId!: string;
}
