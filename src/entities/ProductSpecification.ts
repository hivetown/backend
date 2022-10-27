import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Product } from './Product';

@Entity()
export class ProductSpecification {
	@PrimaryKey({ autoincrement: true })
	public id!: number;

	@Property()
	public name!: string;

	@Property()
	public description!: string;

	@Property()
	public image!: string;

	@OneToMany(() => Product, (product) => product.specification)
	public products = new Collection<Product>(this);
}
