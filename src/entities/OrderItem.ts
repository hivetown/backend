import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Order } from './Order';
import { ProducerProduct } from './ProducerProduct';
import { Shipment } from './Shipment';

@Entity()
export class OrderItem {
	@PrimaryKey()
	public id!: number;

	@Property({ type: 'numeric' })
	public quantity!: number;

	@Property({ type: 'numeric' })
	public price!: number;

	@ManyToOne()
	public order!: Order;

	@ManyToOne()
	public producerProduct!: ProducerProduct;

	@ManyToOne()
	public shipment!: Shipment;
}
