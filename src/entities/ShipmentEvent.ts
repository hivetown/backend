import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Address } from './Address';
import { Shipment } from './Shipment';
import { ShipmentStatus } from './ShipmentStatus';

@Entity()
export class ShipmentEvent {
	@PrimaryKey()
	id!: number;

	@Property({ type: 'date' })
	date!: Date;

	@ManyToOne()
	shipment!: Shipment;

	@ManyToOne()
	address!: Address;

	@ManyToOne()
	shipmentStatus!: ShipmentStatus;
}
