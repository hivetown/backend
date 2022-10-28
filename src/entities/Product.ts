import { DateType, Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import type { Producer } from './Producer';
import type { ProductSpecification } from './ProductSpecification';

@Entity()
export class Product {
	@PrimaryKey({ autoincrement: true })
	private id!: number;

	// eslint-disable-next-line @typescript-eslint/member-ordering
	@ManyToOne()
	public specification!: ProductSpecification;

	@Property()
	private currentPrice!: number;

	@Property({ type: DateType })
	private productionDate!: Date;

	// eslint-disable-next-line @typescript-eslint/member-ordering
	@ManyToOne()
	public producer!: Producer;

	// #region Getters and Setters
	public getId(): number {
		return this.id;
	}

	public getSpecification(): ProductSpecification {
		return this.specification;
	}

	public setSpecification(specification: ProductSpecification): void {
		this.specification = specification;
	}

	public getCurrentPrice(): number {
		return this.currentPrice;
	}

	public setCurrentPrice(currentPrice: number): void {
		this.currentPrice = currentPrice;
	}

	public getProductionDate(): Date {
		return this.productionDate;
	}

	public setProductionDate(productionDate: Date): void {
		this.productionDate = productionDate;
	}

	public getProducer(): Producer {
		return this.producer;
	}

	public setProducer(producer: Producer): void {
		this.producer = producer;
	}

	// #endregion
}
