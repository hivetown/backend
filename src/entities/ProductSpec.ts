import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { ProductSpecCategory } from './ProductSpecCategory';

@Entity()
export class ProductSpec {
	@PrimaryKey()
	public id!: number;

	@Property({ type: 'string' })
	public name!: string;

	@Property({ type: 'string' })
	public description!: string;

	@Property()
	public images!: string[];

	@OneToMany('ProductSpecCategory', 'productSpec')
	public categories = new Collection<ProductSpecCategory>(this);
}
