import { Entity, ManyToOne, PrimaryKeyType, Property } from '@mikro-orm/core';
import { Consumer, ProducerProduct } from '../entities';

@Entity()
export class CartItem {
	@ManyToOne({ primary: true })
	public product!: ProducerProduct;

	@ManyToOne({ primary: true })
	public consumer!: Consumer;

	public [PrimaryKeyType]?: [number, number];

	@Property({ type: 'int' })
	public quantity!: number;

	public addQuantity(quantity: number): void {
		this.quantity = quantity;
	}

	public getTotalPrice(): number {
		return this.product.currentPrice * this.quantity;
	}
}
