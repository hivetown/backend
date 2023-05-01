import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import type { ProducerProduct } from './ProducerProduct';
import type { ProductSpecCategory } from './ProductSpecCategory';
import type { Image } from './Image';
import { SoftDeletable } from 'mikro-orm-soft-delete';

@SoftDeletable(() => ProductSpec, 'deletedAt', () => new Date())
@Entity()
export class ProductSpec {
	@PrimaryKey()
	public id!: number;

	@Property()
	public name!: string;

	@Property()
	public description!: string;

	// VIRTUAL PROPERTIES
	@Property({ persist: false })
	public minPrice = -1;

	@Property({ persist: false })
	public maxPrice = -1;

	@Property({ persist: false })
	public producersCount = 0;
	// -----------------

	// Max 5 images
	@OneToMany('Image', 'productSpec')
	public images = new Collection<Image>(this);

	@OneToMany('ProductSpecCategory', 'productSpec')
	public categories = new Collection<ProductSpecCategory>(this);

	@OneToMany('ProducerProduct', 'productSpec')
	public producerProducts = new Collection<ProducerProduct>(this);

	@Property({ nullable: true })
	public deletedAt?: Date;

	public constructor(name: string, description: string, images: Image[]) {
		this.name = name;
		this.description = description;
		this.images.set(images);
	}
}
