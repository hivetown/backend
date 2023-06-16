import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Address } from './Address';
import { Shipment } from './Shipment';
import { ShipmentStatus } from '../enums/ShipmentStatus';
import type { NotificableEntity } from '../interfaces/NotificationableEntity';

@Entity()
export class ShipmentEvent implements NotificableEntity {
	@PrimaryKey()
	public id!: number;

	@Property({ type: 'date' })
	public date!: Date;

	@ManyToOne({ onDelete: 'cascade' })
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

	public makeMessage(): string {
		switch (this.status) {
			case ShipmentStatus.Paid:
				return `Your shipment from {actor} was paid`;
			case ShipmentStatus.Processing:
				return `Your shipment from {actor} is being processed in ${this.address.getShortAddress()}`;
			case ShipmentStatus.Shipped:
				return `Your shipment from {actor} is in ${this.address.getShortAddress()}`;
			case ShipmentStatus.Delivered:
				return `Your shipment from {actor} was delivered to ${this.address.getFullAddress()}`;
			case ShipmentStatus.Canceled:
				return `Your shipment from {actor} was canceled`;
		}
	}
}
