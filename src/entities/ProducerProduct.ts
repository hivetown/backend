import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Producer } from './Producer';
import { ProductionUnit } from './ProductionUnit';
import { ProductSpec } from './ProductSpec';

@Entity()
export class ProducerProduct {
	@PrimaryKey()
	public id!: number;

	@Property({ type: 'double' })
	public currentPrice!: number;

	@Property({ type: 'date' })
	public productionDate!: Date;

	@Property({ type: 'int' })
	public stock!: number;

	@ManyToOne()
	public producer!: Producer;

	@ManyToOne()
	public productionUnit!: ProductionUnit;

	@ManyToOne()
	public productSpec!: ProductSpec;

	public constructor(
		currentPrice: number,
		productionDate: Date,
		stock: number,
		producer: Producer,
		productionUnit: ProductionUnit,
		productSpec: ProductSpec
	) {
		this.currentPrice = currentPrice;
		this.productionDate = productionDate;
		this.stock = stock;
		this.producer = producer;
		this.productionUnit = productionUnit;
		this.productSpec = productSpec;
	}
}
