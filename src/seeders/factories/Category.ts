import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { Category } from '../../entities';

export class CategoryFactory extends Factory<Category> {
	public model = Category;

	protected definition(faker: Faker): EntityData<Category> {
		return {
			name: faker.commerce.product()
		};
	}
}
