import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { Cart } from '../../entities';

export class CartFactory extends Factory<Cart> {
	public model = Cart;

	protected definition(_faker: Faker): EntityData<Cart> {
		return {};
	}
}
