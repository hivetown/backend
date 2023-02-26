import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey } from '@mikro-orm/core';
import { Category } from './Category';
import { ProductSpec } from './ProductSpec';
import { ProductSpecField } from './ProductSpecField';

@Entity()
export class ProductSpecCategory {
	@PrimaryKey()
	public id!: number;

	@ManyToOne()
	public productSpec!: ProductSpec;

	@ManyToOne()
	public category!: Category;

	@OneToMany(() => ProductSpecField, (field) => field.category)
	public fields = new Collection<ProductSpecField>(this);

	public getId(): number {
		return this.id;
	}

	public getProductSpec(): ProductSpec {
		return this.productSpec;
	}

	public getCategory(): Category {
		return this.category;
	}

	public getFields(): ProductSpecField[] {
		return this.fields.getItems();
	}
}
