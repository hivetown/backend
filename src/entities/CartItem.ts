import { Entity, ManyToOne, PrimaryKeyType, Property } from '@mikro-orm/core';
import { Consumer, ProducerProduct } from '../entities';

@Entity()
export class CartItem {
	@ManyToOne({ primary: true })
	public producerProduct!: ProducerProduct;

	@ManyToOne({ primary: true })
	public consumer!: Consumer;

	public [PrimaryKeyType]?: [number, number];

	@Property({ type: 'int' })
	public quantity!: number;

	public constructor(consumer: Consumer, product: ProducerProduct, quantity: number) {
		this.consumer = consumer;
		this.producerProduct = product;
		this.quantity = quantity;
	}
}
