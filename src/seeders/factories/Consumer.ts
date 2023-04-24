import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { Consumer } from '../../entities';

export class ConsumerFactory extends Factory<Consumer> {
	public model = Consumer;

	protected definition(faker: Faker): EntityData<Consumer> {
		return {
			name: faker.name.fullName(),
			email: faker.internet.email(),
			phone: faker.phone.number('9########'),
			vat: faker.phone.number('2########'), // It's fine to use phone number generator for vat
			authId: faker.datatype.uuid()
		};
	}
}
