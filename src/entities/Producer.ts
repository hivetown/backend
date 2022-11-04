import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Product } from './Product';

@Entity()
export class Producer {
	@PrimaryKey({ autoincrement: true, type: 'numeric' })
	private id!: number;

	@Property()
	private name!: string;

	@Property()
	private email!: string;

	@Property({ type: 'numeric' })
	private phone!: number;

	@Property({ type: 'numeric' })
	private vat!: number;

	@OneToMany(() => Product, (product) => product.producer)
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

	public getEmail(): string {
		return this.email;
	}

	public setEmail(email: string): void {
		this.email = email;
	}

	public getPhone(): number {
		return this.phone;
	}

	public setPhone(phone: number): void {
		this.phone = phone;
	}

	public getVat(): number {
		return this.vat;
	}

	public setVat(vat: number): void {
		this.vat = vat;
	}

	public getProductN(n: number): Product {
		return this.products[n];
	}
	// #endregion
}
