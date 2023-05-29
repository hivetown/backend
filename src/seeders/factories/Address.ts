import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { Address } from '../../entities';

const baseValidDoors = ['Esquerda', 'Direita', 'Frente', 'Trás'];
// baseValidDoors + baseValidDoors (first 3 letters with dot) + baseValidDoors (first letter with dot)

const validDoors = baseValidDoors
	.concat(baseValidDoors.map((door) => door.slice(0, 3).concat('.')))
	.concat(baseValidDoors.map((door) => door.slice(0, 1).concat('.')));

// Define as coordenadas geográficas limites para Portugal continental
const portugalLatitudeRange = {
	min: 36.838,
	max: 42.28
};

const portugalLongitudeRange = {
	min: -9.498,
	max: -6.189
};
export class AddressFactory extends Factory<Address> {
	public model = Address;

	protected definition(faker: Faker): EntityData<Address> {
		const county = faker.address.county();
		return {
			number: Number(faker.address.buildingNumber()),
			door: faker.helpers.arrayElement(validDoors),
			floor: faker.datatype.number({ min: 0, max: 150 }),
			zipCode: faker.address.zipCode(),
			street: faker.address.street(),
			parish: `parish:${county}`, // we add a p to the county name to make it a parish (just so we know its different)
			county,
			city: faker.address.cityName(),
			district: faker.address.state(),
			latitude: faker.datatype.float({ min: portugalLatitudeRange.min, max: portugalLatitudeRange.max }),
			longitude: faker.datatype.float({ min: portugalLongitudeRange.min, max: portugalLongitudeRange.max })
		};
	}
}
