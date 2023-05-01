import { Collection, Entity, Enum, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { ProductionUnit } from './ProductionUnit';
import { CarrierStatus } from '../enums/CarrierStatus';
import { Shipment } from './Shipment';
import type { Image } from './Image';

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
}
