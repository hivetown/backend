import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { Consumer } from '../../entities';

export class ConsumerFactory extends Factory<Consumer> {
	public model = Consumer;

	protected definition(_faker: Faker): EntityData<Consumer> {
		return {};
	}
}
