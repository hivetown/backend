import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { Shipment } from '../../entities';

export class ShipmentFactory extends Factory<Shipment> {
	public model = Shipment;

	protected definition(_faker: Faker): EntityData<Shipment> {
		return {};
	}
}
