import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import type { ShipmentStatus } from '../enums';
import { Order } from './Order';
import { ProducerProduct } from './ProducerProduct';
import { Shipment } from './Shipment';

@Entity()
export class OrderItem {
	@ManyToOne({ primary: true, onDelete: 'cascade' })
	public order!: Order;

	@ManyToOne({ primary: true })
	public producerProduct!: ProducerProduct;

	@Property({ type: 'int' })
	public quantity!: number;

	@Property({ type: 'double' })
	public price!: number;

	@ManyToOne()
	public shipment!: Shipment;

	public create(order: Order, producerProduct: ProducerProduct, quantity: number): OrderItem {
		this.order = order;
		this.producerProduct = producerProduct;
		this.quantity = quantity;
		this.price = producerProduct.currentPrice;
		this.shipment = new Shipment();
		return this;
	}

	public getActualStatus(): ShipmentStatus {
		return this.shipment.getLastEvent().status;
	}

	public getFirstDate(): Date {
		return this.shipment.getFirstEvent().date;
	}
}
