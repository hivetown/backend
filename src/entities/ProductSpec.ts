import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { ProductSpecCategory } from './ProductSpecCategory';

@Entity()
export class ProductSpec {
	@PrimaryKey()
	id!: number;

	@Property({ type: 'string' })
	name!: string;

	@Property({ type: 'string' })
	description!: string;

	@Property()
	images!: string[];

	@OneToMany('ProductSpecCategory', 'productSpec')
	categories = new Collection<ProductSpecCategory>(this);
}
