import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class ShipmentStatus {
	@PrimaryKey()
	public id!: number;

	@Property()
	public name!: string;

	@Property()
	public description!: string;
}
