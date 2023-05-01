import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { ProductSpec } from '../../entities';
import { generateImage } from '../helpers';

export class ProductSpecFactory extends Factory<ProductSpec> {
	public model = ProductSpec;

	protected definition(faker: Faker): EntityData<ProductSpec> {
		return {
			name: faker.commerce.productName(),
			description: faker.commerce.productDescription(),
			// Generate 1 to 6 images
			images: Array.from({ length: faker.datatype.number({ min: 1, max: 6 }) }, () => generateImage('dog'))
		};
	}
}
