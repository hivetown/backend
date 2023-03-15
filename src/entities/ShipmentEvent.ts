import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Address } from './Address';
import { Shipment } from './Shipment';
import { ShipmentStatus } from './ShipmentStatus';

@Entity()
export class ShipmentEvent {
	@PrimaryKey()
	public id!: number;

	@Property({ type: 'date' })
	public date!: Date;

	@ManyToOne()
	public shipment!: Shipment;

	@ManyToOne()
	public address!: Address;

	@ManyToOne()
	public status!: ShipmentStatus;
}
