import { faker } from '@faker-js/faker';
import { Address } from '../../entities';

export const generateRandomAddress = (): Address => {
	const address = new Address();
	address.number = Number(faker.random.numeric(2));
	address.door = Number(faker.random.numeric(2));
	address.floor = Number(faker.random.numeric(2));
	address.zipCode = faker.address.zipCode();
	address.street = faker.address.street();
	address.parish = faker.address.county(); // It's fine to use county as parish
	address.county = faker.address.county();
	address.city = faker.address.city();
	address.district = faker.address.city(); // It's fine to use city as district
	address.latitude = Number(faker.address.latitude());
	address.longitude = Number(faker.address.longitude());
	return address;
};
