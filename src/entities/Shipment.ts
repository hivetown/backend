import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryKey } from '@mikro-orm/core';
import { Carrier } from './Carrier';
import { OrderItem } from './OrderItem';
import { ShipmentEvent } from './ShipmentEvent';

@Entity()
export class Shipment {
	@PrimaryKey()
	public id!: number;

	@ManyToMany()
	public orders = new Collection<OrderItem>(this);

	@ManyToOne()
	public carrier!: Carrier;

	@OneToMany('ShipmentEvent', 'shipment')
	public events = new Collection<ShipmentEvent>(this);

	@OneToMany('OrderItem', 'shipment')
	public products = new Collection<OrderItem>(this);
}
