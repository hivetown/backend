import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { ProducerProduct } from '../../entities';

export class ProducerProductFactory extends Factory<ProducerProduct> {
	public model = ProducerProduct;

	protected definition(faker: Faker): EntityData<ProducerProduct> {
		return {
			currentPrice: faker.datatype.number({ min: 1, max: 999 }),
			productionDate: faker.date.past(),
			stock: faker.datatype.number({ min: 0, max: 100 })
		};
	}
}
