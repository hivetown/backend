import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { CarrierStatus } from '../../enums';
import { Carrier } from '../../entities';

export class CarrierFactory extends Factory<Carrier> {
	public model = Carrier;

	protected definition(faker: Faker): EntityData<Carrier> {
		return {
			licensePlate: faker.vehicle.vrm(),
			status: faker.helpers.arrayElement(Object.values(CarrierStatus))
		};
	}
}
