import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Address } from './Address';
import { Shipment } from './Shipment';
import { ShipmentStatus } from '../enums/ShipmentStatus';

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

	@Enum()
	public status!: ShipmentStatus;

	public create(shipment: Shipment, status: ShipmentStatus, address: Address): ShipmentEvent {
		this.shipment = shipment;
		this.status = status;
		this.address = address;
		this.date = new Date();
		return this;
	}
}
