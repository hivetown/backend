import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Product } from './Product';

@Entity()
export class ProductSpecification {
	@PrimaryKey({ autoincrement: true })
	private id!: number;

	@Property()
	private name!: string;

	@Property()
	private description!: string;

	@Property()
	private image!: string;

	@OneToMany(() => Product, (product) => product.specification)
	private products = new Collection<Product>(this);

	// #region Getters and Setters
	public getId(): number {
		return this.id;
	}

	public getName(): string {
		return this.name;
	}

	public setName(name: string): void {
		this.name = name;
	}

	public getDescription(): string {
		return this.description;
	}

	public setDescription(description: string): void {
		this.description = description;
	}

	public getImage(): string {
		return this.image;
	}

	public setImage(image: string): void {
		this.image = image;
	}

	public getProductN(n: number): Product {
		return this.products[n];
	}
	// #endregion
}
