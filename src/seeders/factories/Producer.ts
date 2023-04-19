import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { Producer } from '../../entities';

export class ProducerFactory extends Factory<Producer> {
	public model = Producer;

	protected definition(faker: Faker): EntityData<Producer> {
		return {
			name: faker.company.name(),
			email: faker.internet.email(),
			phone: faker.phone.number('9########'),
			vat: Number(faker.phone.number('2########')),
			authId: faker.datatype.uuid()
		};
	}
}
