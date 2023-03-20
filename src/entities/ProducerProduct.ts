import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Producer } from './Producer';
import { ProductionUnit } from './ProductionUnit';
import { ProductSpec } from './ProductSpec';
import { ProducerProductStatus } from '../enums/ProducerProductStatus';

@Entity()
export class ProducerProduct {
	@PrimaryKey()
	public id!: number;

	@Property({ type: 'double' })
	public currentPrice!: number;

	@Property({ type: 'date' })
	public productionDate!: Date;

	@Enum()
	public status!: ProducerProductStatus;

	@ManyToOne()
	public producer!: Producer;

	@ManyToOne()
	public productionUnit!: ProductionUnit;

	@ManyToOne()
	public productSpec!: ProductSpec;
}
