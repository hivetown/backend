import { Entity, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
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

	@OneToOne({ hidden: true })
	public carrier?: Carrier;

	@OneToOne({ hidden: true })
	public category?: Category;

	@OneToOne({ hidden: true })
	public consumer?: Consumer;

	@OneToOne({ hidden: true })
	public producerImage?: Producer;

	@ManyToOne({ hidden: true })
	public producerImages?: Producer;

	@ManyToOne({ hidden: true })
	public productionUnit?: ProductionUnit;

	@ManyToOne({ hidden: true })
	public productSpec?: ProductSpec;

	public constructor(name: string, url: string, alt: string) {
		this.name = name;
		this.url = url;
		this.alt = alt;
	}
}
