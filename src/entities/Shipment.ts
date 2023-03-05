import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey } from '@mikro-orm/core';
import { Carrier } from './Carrier';
import type { OrderItem } from './OrderItem';
import type { ShipmentEvent } from './ShipmentEvent';

@Entity()
export class Shipment {
	@PrimaryKey()
	public id!: number;

	@ManyToOne()
	public carrier!: Carrier;

	@OneToMany('OrderItem', 'shipment')
	public orders = new Collection<OrderItem>(this);

	@OneToMany('ShipmentEvent', 'shipment')
	public events = new Collection<ShipmentEvent>(this);

	@OneToMany('OrderItem', 'shipment')
	public products = new Collection<OrderItem>(this);
}
