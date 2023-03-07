import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { OrderItem } from '../../entities';

export class OrderItemFactory extends Factory<OrderItem> {
	public model = OrderItem;

	protected definition(faker: Faker): EntityData<OrderItem> {
		return {
			quantity: faker.datatype.number(13),
			price: faker.datatype.number(13)
		};
	}
}
