import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { Producer } from '../../entities';

export class ProducerFactory extends Factory<Producer> {
	public model = Producer;

	protected definition(_faker: Faker): EntityData<Producer> {
		return {};
	}
}
