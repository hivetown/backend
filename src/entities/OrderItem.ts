import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Order } from './Order';
import { ProducerProduct } from './ProducerProduct';
import { Shipment } from './Shipment';

@Entity()
export class OrderItem {
	@PrimaryKey()
	id!: number;

	@Property({ type: 'numeric' })
	quantity!: number;

	@Property({ type: 'numeric' })
	price!: number;

	@ManyToOne()
	order!: Order;

	@ManyToOne()
	producerProduct!: ProducerProduct;

	@ManyToOne()
	shipment!: Shipment;
}
