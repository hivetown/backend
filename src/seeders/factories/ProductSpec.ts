import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { ProductSpec } from '../../entities';

export class ProductSpecFactory extends Factory<ProductSpec> {
	public model = ProductSpec;

	protected definition(faker: Faker): EntityData<ProductSpec> {
		return {
			name: faker.commerce.productName(),
			description: faker.commerce.productDescription()
		};
	}
}
