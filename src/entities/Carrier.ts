import { Entity, Enum, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { ProductionUnit } from './ProductionUnit';
import { CarrierStatus } from '../enums/CarrierStatus';
import type { Image } from './Image';

@Entity()
export class Carrier {
	@PrimaryKey()
	public id!: number;

	@Property()
	public licensePlate!: string;

	@ManyToOne()
	public productionUnit!: ProductionUnit;

	@Enum()
	public status!: CarrierStatus;

	@OneToOne()
	public image?: Image;
}
