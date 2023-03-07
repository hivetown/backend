import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { ProductSpec } from '../../entities';

const generateMultiple = (generator: () => any, min: number, max: number) => {
	const quantity = Math.floor(Math.random() * (max - min + 1)) + min;
	const items = [];
	for (let i = 0; i < quantity; i++) {
		items.push(generator());
	}
	return items;
};

export class ProductSpecFactory extends Factory<ProductSpec> {
	public model = ProductSpec;

	protected definition(faker: Faker): EntityData<ProductSpec> {
		return {
			name: faker.commerce.productName(),
			description: faker.commerce.productDescription(),
			images: generateMultiple(() => faker.image.imageUrl(640, 480, 'cat', true), 1, 10)
		};
	}
}
