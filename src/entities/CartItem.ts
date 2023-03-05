import { Entity, ManyToOne, PrimaryKeyType, Property } from '@mikro-orm/core';
import { Cart, ProducerProduct } from '../entities';

@Entity()
export class CartItem {
	@ManyToOne({ primary: true })
	public product!: ProducerProduct;

	@ManyToOne({ primary: true })
	public cart!: Cart;

	public [PrimaryKeyType]?: [number, number];

	@Property({ type: 'int' })
	public quantity!: number;
}
