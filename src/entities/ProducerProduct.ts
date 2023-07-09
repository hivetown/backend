import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Producer } from './Producer';
import { ProductionUnit } from './ProductionUnit';
import { ProductSpec } from './ProductSpec';
import { SoftDeletable } from 'mikro-orm-soft-delete';
import type { OrderItem } from './OrderItem';

@SoftDeletable(() => ProducerProduct, 'deletedAt', () => new Date())
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

	@OneToMany('OrderItem', 'producerProduct', { hidden: true })
	public orderItems = new Collection<OrderItem>(this);

	@Property({ nullable: true })
	public deletedAt?: Date;

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
