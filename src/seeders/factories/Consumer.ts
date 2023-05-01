import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { Consumer } from '../../entities';
import { generateImage } from '../helpers';

export class ConsumerFactory extends Factory<Consumer> {
	public model = Consumer;

	protected definition(faker: Faker): EntityData<Consumer> {
		const firstName = faker.name.firstName();
		const lastName = faker.name.lastName();

		return {
			name: `${firstName} ${lastName}`,
			email: faker.internet.email(firstName, lastName),
			phone: faker.phone.number('9########'),
			vat: faker.phone.number('2########'), // It's fine to use phone number generator for vat
			authId: faker.datatype.uuid(),
			image: generateImage('avatar')
		};
	}
}
