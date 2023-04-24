import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import type { ShipmentStatus } from '../enums';
import { Order } from './Order';
import { ProducerProduct } from './ProducerProduct';
import { Shipment } from './Shipment';

@Entity()
export class OrderItem {
	@ManyToOne({ primary: true })
	public order!: Order;

	@ManyToOne({ primary: true })
	public producerProduct!: ProducerProduct;

	@Property({ type: 'int' })
	public quantity!: number;

	@Property({ type: 'double' })
	public price!: number;

	@ManyToOne()
	public shipment!: Shipment;

	public getActualStatus(): ShipmentStatus {
		return this.shipment.getLastEvent().status;
	}
}
