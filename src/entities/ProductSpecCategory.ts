import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, PrimaryKeyType } from '@mikro-orm/core';
import { Category } from './Category';
import { ProductSpec } from './ProductSpec';
import { ProductSpecField } from './ProductSpecField';

@Entity()
export class ProductSpecCategory {
	@ManyToOne({ primary: true })
	public productSpec!: ProductSpec;

	@ManyToOne({ primary: true })
	public category!: Category;

	public [PrimaryKeyType]?: [number, number];

	@OneToMany(() => ProductSpecField, (field) => field.category)
	public fields = new Collection<ProductSpecField>(this);
}
