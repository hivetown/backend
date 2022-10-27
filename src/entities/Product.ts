import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import type { Producer } from './Producer';
import type { ProductSpecification } from './ProductSpecification';

@Entity()
export class Product {
	@PrimaryKey({ autoincrement: true })
	public id!: number;

	@ManyToOne()
	public specification!: ProductSpecification;

	@Property()
	public currentPrice!: number;

	@Property()
	public productionDate!: Date;

	@ManyToOne()
	public producer!: Producer;
}
