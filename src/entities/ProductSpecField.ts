import { Entity, ManyToOne, PrimaryKeyType, Property } from '@mikro-orm/core';
import { Field } from './Field';
import { ProductSpec } from './ProductSpec';
import { ProductSpecCategory } from './ProductSpecCategory';

@Entity()
export class ProductSpecField {
	@ManyToOne({ primary: true })
	public spec!: ProductSpec;

	@ManyToOne({ primary: true })
	public field!: Field;

	@ManyToOne({ primary: true })
	public category!: ProductSpecCategory;

	@Property()
	public value!: unknown;

	public [PrimaryKeyType]?: [ProductSpec, Field, ProductSpecCategory];
}
