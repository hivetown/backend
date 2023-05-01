import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Producer } from './Producer';
import { ProductionUnit } from './ProductionUnit';
import { ProductSpec } from './ProductSpec';
import { SoftDeletable } from 'mikro-orm-soft-delete';

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

	@Property({ nullable: true })
	public deletedAt?: Date;
}
