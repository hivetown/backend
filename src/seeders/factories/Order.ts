import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { Order } from '../../entities';

export class OrderFactory extends Factory<Order> {
	public model = Order;

	protected definition(_faker: Faker): EntityData<Order> {
		return {};
	}
}
