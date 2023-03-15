import { Entity, Property, PrimaryKey } from '@mikro-orm/core';

@Entity()
export class Address {
	@PrimaryKey()
	public id!: number;

	@Property({ type: 'int' })
	public number!: number;

	@Property({ type: 'int' })
	public door!: number;

	@Property({ type: 'int' })
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

	@Property({ type: 'double' })
	public latitude!: number;

	@Property({ type: 'double' })
	public longitude!: number;
}
