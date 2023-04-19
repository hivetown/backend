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
	public orderItems = new Collection<OrderItem>(this);

	@OneToMany('ShipmentEvent', 'shipment')
	public events = new Collection<ShipmentEvent>(this);

	public getLastEvent(): ShipmentEvent {
		return this.events.getItems().sort((a, b) => b.date.getTime() - a.date.getTime())[0];
	}

	public getFirstEvent(): ShipmentEvent {
		return this.events.getItems().sort((a, b) => a.date.getTime() - b.date.getTime())[0];
	}
}
