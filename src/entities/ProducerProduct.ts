import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Producer } from './Producer';
import { ProductionUnit } from './ProductionUnit';
import { ProductSpec } from './ProductSpec';
import { ProducerProductStatus } from '../enums/ProducerProductStatus';

@Entity()
export class ProducerProduct {
	@PrimaryKey()
	public id!: number;

	@Property({ type: 'numeric' })
	public currentPrice!: number;

	@Property({ type: 'date' })
	public productionDate!: Date;

	@ManyToOne()
	public producer!: Producer;

	@ManyToOne()
	public productionUnit!: ProductionUnit;

	@ManyToOne()
	public productSpec!: ProductSpec;

	@Enum()
	public status!: ProducerProductStatus;

	public getId(): number {
		return this.id;
	}

	public getCurrentPrice(): number {
		return this.currentPrice;
	}

	public getProductionDate(): Date {
		return this.productionDate;
	}

	public getProducer(): Producer {
		return this.producer;
	}

	public getProductionUnit(): ProductionUnit {
		return this.productionUnit;
	}

	public getProductSpec(): ProductSpec {
		return this.productSpec;
	}

	public getStatus(): ProducerProductStatus {
		return this.status;
	}
}
