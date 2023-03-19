import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { ProductSpecCategory } from '../../entities';

export class ProductSpecCategoryFactory extends Factory<ProductSpecCategory> {
	public model = ProductSpecCategory;

	protected definition(_faker: Faker): EntityData<ProductSpecCategory> {
		return {};
	}
}
