import { Collection, Entity, Enum, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { ProductionUnit } from './ProductionUnit';
import { CarrierStatus } from '../enums/CarrierStatus';
import { Shipment } from './Shipment';

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
}
