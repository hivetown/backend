import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey } from '@mikro-orm/core';
import { Category } from './Category';
import { ProductSpec } from './ProductSpec';
import { ProductSpecField } from './ProductSpecField';

@Entity()
export class ProductSpecCategory {
	@PrimaryKey()
	id!: number;

	@ManyToOne()
	productSpec!: ProductSpec;

	@ManyToOne()
	category!: Category;

	@OneToMany(() => ProductSpecField, (field) => field.category)
	fields = new Collection<ProductSpecField>(this);
}
