import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { ProductionUnit } from '../../entities';
import { generateImage } from '../helpers';

export class ProductionUnitFactory extends Factory<ProductionUnit> {
	public model = ProductionUnit;

	protected definition(faker: Faker): EntityData<ProductionUnit> {
		return {
			name: faker.company.name(),
			// Generate 1 to 6 images
			images: Array.from({ length: faker.datatype.number({ min: 1, max: 6 }) }, () => generateImage('factory'))
		};
	}
}
