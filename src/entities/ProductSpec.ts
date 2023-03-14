import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import type { ProducerProduct } from './ProducerProduct';
import type { ProductSpecCategory } from './ProductSpecCategory';

@Entity()
export class ProductSpec {
	@PrimaryKey()
	public id!: number;

	@Property()
	public name!: string;

	@Property()
	public description!: string;

	@Property({ type: 'array' })
	public images!: string[];

	@OneToMany('ProductSpecCategory', 'productSpec')
	public categories = new Collection<ProductSpecCategory>(this);

	@OneToMany('ProducerProduct', 'productSpec')
	public producerProducts = new Collection<ProducerProduct>(this);
}
