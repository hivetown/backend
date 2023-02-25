import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { ProductionUnit } from './ProductionUnit';
import { CarrierStatus } from '../enums/CarrierStatus';

@Entity()
export class Carrier {
	@PrimaryKey()
	id!: number;

	@Property({ type: 'string' })
	licensePlate!: string;

	@ManyToOne()
	productionUnit!: ProductionUnit;

	@Enum()
	status!: CarrierStatus;
}
