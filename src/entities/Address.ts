import { Entity, Property, PrimaryKey } from '@mikro-orm/core';

@Entity()
export class Address {
	@PrimaryKey()
	id!: number;

	@Property({ type: 'numeric' })
	number!: number;

	@Property({ type: 'numeric' })
	door!: number;

	@Property({ type: 'numeric' })
	floor!: number;

	@Property()
	zipCode!: string;

	@Property()
	street!: string;

	@Property()
	parish!: string;

	@Property()
	county!: string;

	@Property()
	city!: string;

	@Property()
	district!: string;

	@Property({ type: 'numeric' })
	latitude!: number;

	@Property({ type: 'numeric' })
	longitude!: number;
}
