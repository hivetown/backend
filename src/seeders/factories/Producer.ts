import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { Producer } from '../../entities';
import { generateImage } from '../helpers';

export class ProducerFactory extends Factory<Producer> {
	public model = Producer;

	protected definition(faker: Faker): EntityData<Producer> {
		const firstName = faker.name.firstName();
		const lastName = faker.name.lastName();

		return {
			name: `${firstName} ${lastName}`,
			email: faker.internet.email(firstName, lastName),
			phone: faker.phone.number('91#######'),
			vat: faker.phone.number('21#######'), // It's fine to use phone number generator for vat
			authId: faker.datatype.uuid(),
			image: generateImage('shop'),
			// generate 1 to 6 images
			images: Array.from({ length: faker.datatype.number({ min: 1, max: 6 }) }, () => generateImage('mcdonalds'))
		};
	}
}
