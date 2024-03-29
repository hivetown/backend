import { Collection, Entity, Enum, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { ProductionUnit } from './ProductionUnit';
import { CarrierStatus } from '../enums/CarrierStatus';
import { Shipment } from './Shipment';
import type { Image } from './Image';
import type { ShipmentEvent } from './ShipmentEvent';

@Entity()
export class Carrier {
	@PrimaryKey()
	public id!: number;

	@Property()
	public licensePlate!: string;

	@ManyToOne()
	public productionUnit!: ProductionUnit;

	@Enum()
	public status!: CarrierStatus;

	@OneToMany(() => Shipment, (shipment) => shipment.carrier)
	public shipments = new Collection<Shipment>(this);

	@OneToOne({ eager: true })
	public image?: Image;

	@Property({ nullable: true })
	public deletedAt?: Date;

	public constructor(licensePlate: string, productionUnit: ProductionUnit, image: Image) {
		this.licensePlate = licensePlate;
		this.productionUnit = productionUnit;
		this.image = image;
		this.status = CarrierStatus.Available;
	}

	public getLastShipmentEvent(): ShipmentEvent | null {
		if (this.shipments.length === 0) {
			return null;
		}
		const lastShipment = this.shipments[this.shipments.length - 1];
		if (lastShipment.events.length === 0) {
			return null;
		}
		return lastShipment.getLastEvent();
	}
}
