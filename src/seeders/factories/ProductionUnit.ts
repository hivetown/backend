import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { ProductionUnit } from '../../entities';

export class ProductionUnitFactory extends Factory<ProductionUnit> {
	public model = ProductionUnit;

	protected definition(faker: Faker): EntityData<ProductionUnit> {
		return {
			name: faker.company.name()
		};
	}
}
