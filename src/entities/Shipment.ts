import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryKey } from '@mikro-orm/core';
import { Carrier } from './Carrier';
import { OrderItem } from './OrderItem';
import { ShipmentEvent } from './ShipmentEvent';

@Entity()
export class Shipment {
	@PrimaryKey()
	id!: number;

	@ManyToMany()
	orders = new Collection<OrderItem>(this);

	@ManyToOne()
	carrier!: Carrier;

	@OneToMany('ShipmentEvent', 'shipment')
	events = new Collection<ShipmentEvent>(this);

	@OneToMany('OrderItem', 'shipment')
	products = new Collection<OrderItem>(this);
}
