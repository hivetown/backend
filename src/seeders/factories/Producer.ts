import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { Producer } from '../../entities';
import { generateImage } from '../helpers';

export class ProducerFactory extends Factory<Producer> {
	public model = Producer;

	protected definition(faker: Faker): EntityData<Producer> {
		return {
			name: faker.company.name(),
			email: faker.internet.email(),
			phone: faker.phone.number('9########'),
			vat: faker.phone.number('2########'),
			authId: faker.datatype.uuid(),
			image: generateImage('shop'),
			// generate 1 to 6 images
			images: Array.from({ length: faker.datatype.number({ min: 1, max: 6 }) }, () => generateImage('mcdonalds'))
		};
	}
}
