import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { ShipmentStatus } from '../../entities';

export class ShipmentStatusFactory extends Factory<ShipmentStatus> {
	public model = ShipmentStatus;

	protected definition(faker: Faker): EntityData<ShipmentStatus> {
		return {
			name: faker.random.word(),
			description: faker.random.words()
		};
	}
}
