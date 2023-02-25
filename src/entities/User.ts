import { Entity, Property } from '@mikro-orm/core';

@Entity({ abstract: true })
export abstract class User {
	@Property()
	public name!: string;

	@Property()
	public email!: string;

	@Property({ type: 'numeric' })
	public phone!: number;

	@Property({ type: 'numeric', unique: true })
	public vat!: number;
}
