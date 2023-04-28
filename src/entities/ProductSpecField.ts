import { Entity, ManyToOne, PrimaryKeyType, Property } from '@mikro-orm/core';
import { Field } from './Field';
import { ProductSpecCategory } from './ProductSpecCategory';

@Entity()
export class ProductSpecField {
	@ManyToOne({ primary: true })
	public productSpecCategory!: ProductSpecCategory;

	@ManyToOne({ primary: true })
	public field!: Field;

	public [PrimaryKeyType]?: [number, number, number];

	@Property()
	public value!: string;

	public constructor(productSpecCategory: ProductSpecCategory, field: Field, value: string) {
		this.productSpecCategory = productSpecCategory;
		this.field = field;
		this.value = value;
	}
}
