import { Entity, Property } from '@mikro-orm/core';

@Entity({ abstract: true })
export abstract class User {
	@Property()
	public name!: string;

	@Property()
	public email!: string;

	@Property({ type: 'double' })
	public phone!: number;

	@Property({ type: 'double', unique: true })
	public vat!: number;
}
