import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { User, UserType } from '../../entities';
import { generateImage } from '../helpers';

export class UserFactory extends Factory<User> {
	public model = User;

	protected definition(faker: Faker): EntityData<User> {
		const firstName = faker.name.firstName();
		const lastName = faker.name.lastName();

		return {
			name: `${firstName} ${lastName}`,
			email: faker.internet.email(firstName, lastName),
			phone: faker.phone.number('91#######'),
			vat: faker.phone.number('21#######'), // It's fine to use phone number generator for vat
			authId: faker.datatype.uuid(),
			image: generateImage('shop'),
			type: UserType.Consumer
		};
	}
}
