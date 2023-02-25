import { Entity, Property, PrimaryKey } from '@mikro-orm/core';

@Entity()
export class Address {
	@PrimaryKey()
	public id!: number;

	@Property({ type: 'numeric' })
	public number!: number;

	@Property({ type: 'numeric' })
	public door!: number;

	@Property({ type: 'numeric' })
	public floor!: number;

	@Property()
	public zipCode!: string;

	@Property()
	public street!: string;

	@Property()
	public parish!: string;

	@Property()
	public county!: string;

	@Property()
	public city!: string;

	@Property()
	public district!: string;

	@Property({ type: 'numeric' })
	public latitude!: number;

	@Property({ type: 'numeric' })
	public longitude!: number;
}
