import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { ProductionUnit } from './ProductionUnit';
import { CarrierStatus } from '../enums/CarrierStatus';

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
}
