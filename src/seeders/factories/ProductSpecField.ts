import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { ProductSpecField } from '../../entities';

export class ProductSpecFieldFactory extends Factory<ProductSpecField> {
	public model = ProductSpecField;

	protected definition(faker: Faker): EntityData<ProductSpecField> {
		return {
			// TODO same as category
			value: faker.random.word()
		};
	}
}
