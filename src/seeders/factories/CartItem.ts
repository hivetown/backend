import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { CartItem } from '../../entities';

export class CartItemFactory extends Factory<CartItem> {
	public model = CartItem;

	protected definition(faker: Faker): EntityData<CartItem> {
		return {
			quantity: faker.datatype.number({ min: 1, max: 10 })
		};
	}
}
