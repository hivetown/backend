import { Entity, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import type { Category } from './Category';
import type { ProductionUnit } from './ProductionUnit';
import type { ProductSpec } from './ProductSpec';
import type { Carrier } from './Carrier';
import type { Consumer } from './Consumer';
import type { Producer } from './Producer';

@Entity()
export class Image {
	@PrimaryKey()
	public id!: number;

	@Property()
	public name!: string;

	@Property()
	public url!: string;

	@Property()
	public alt!: string;

	@OneToOne()
	public carrier?: Carrier;

	@OneToOne()
	public category?: Category;

	@OneToOne()
	public consumerImage?: Consumer;

	@OneToOne()
	public producerImage?: Producer;

	@ManyToOne()
	public producerImages?: Producer;

	@ManyToOne()
	public productionUnit?: ProductionUnit;

	@ManyToOne()
	public productSpec?: ProductSpec;
}
