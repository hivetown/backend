import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Producer } from './Producer';
import { ProductionUnit } from './ProductionUnit';
import { ProductSpec } from './ProductSpec';
import { ProducerProductStatus } from '../enums/ProducerProductStatus';

@Entity()
export class ProducerProduct {
	@PrimaryKey()
	id!: number;

	@Property({ type: 'numeric' })
	currentPrice!: number;

	@Property({ type: 'date' })
	productionDate!: Date;

	@ManyToOne()
	producer!: Producer;

	@ManyToOne()
	productionUnit!: ProductionUnit;

	@ManyToOne()
	productSpec!: ProductSpec;

	@Enum()
	status!: ProducerProductStatus;
}
