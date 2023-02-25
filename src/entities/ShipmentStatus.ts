import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class ShipmentStatus {
	@PrimaryKey()
	public id!: number;

	@Property({ type: 'string' })
	public name!: string;

	@Property({ type: 'string' })
	public description!: string;
}
