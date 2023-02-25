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
}
