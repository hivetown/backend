import { Entity, ManyToOne, PrimaryKeyType, Property } from '@mikro-orm/core';
import { Field } from './Field';
import { ProductSpec } from './ProductSpec';
import { ProductSpecCategory } from './ProductSpecCategory';

@Entity()
export class ProductSpecField {
	@ManyToOne({ primary: true })
	spec!: ProductSpec;

	@ManyToOne({ primary: true })
	field!: Field;

	@ManyToOne({ primary: true })
	category!: ProductSpecCategory;

	@Property()
	value!: unknown;

	[PrimaryKeyType]?: [ProductSpec, Field, ProductSpecCategory];
}
