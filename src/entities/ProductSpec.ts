import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import type { ProductSpecCategory } from './ProductSpecCategory';
import type { Image } from './Image';

@Entity()
export class ProductSpec {
	@PrimaryKey()
	public id!: number;

	@Property()
	public name!: string;

	@Property()
	public description!: string;

	@OneToMany('Image', 'productSpec')
	public images = new Collection<Image>(this);

	@OneToMany('ProductSpecCategory', 'productSpec')
	public categories = new Collection<ProductSpecCategory>(this);
}
