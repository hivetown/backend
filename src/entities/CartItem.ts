import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Cart, ProducerProduct } from '../entities';

@Entity()
export class CartItem {
	@PrimaryKey()
	public id!: number;

	@Property({ type: 'numeric' })
	public quantity!: number;

	@ManyToOne()
	public product!: ProducerProduct;

	@ManyToOne()
	public cart!: Cart;

	public constructor(product: ProducerProduct, cart: Cart) {
		this.product = product;
		this.quantity = 1;
		this.cart = cart;
	}

	public addQuantity(quantity: number): void {
		this.quantity = quantity;
	}

	public getTotalPrice(): number {
		return this.product.currentPrice * this.quantity;
	}
}
