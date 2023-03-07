import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { ShipmentEvent } from '../../entities';

export class ShipmentEventFactory extends Factory<ShipmentEvent> {
	public model = ShipmentEvent;

	protected definition(faker: Faker): EntityData<ShipmentEvent> {
		return {
			date: faker.date.past()
		};
	}
}
