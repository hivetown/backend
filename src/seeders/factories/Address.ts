import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { Address } from '../../entities';

export class AddressFactory extends Factory<Address> {
	public model = Address;

	protected definition(faker: Faker): EntityData<Address> {
		return {
			number: Number(faker.random.numeric(2)),
			door: faker.random.numeric(2),
			floor: Number(faker.random.numeric(2)),
			zipCode: faker.address.zipCode(),
			street: faker.address.street(),
			parish: faker.address.county(), // It's fine to use county as parish
			county: faker.address.county(),
			city: faker.address.city(),
			district: faker.address.city(), // It's fine to use city as district
			latitude: Number(faker.address.latitude()),
			longitude: Number(faker.address.longitude())
		};
	}
}
