import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Order } from '../entities';

export class OrderGateway {
	private repository: EntityRepository<Order>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Order);
	}

	public async findByConsumer(consumerId: number): Promise<Order[]> {
		const orders = await this.repository.find({ consumer: consumerId }, { fields: ['shippingAddress'] });
		return orders;
	}

	public async findByConsumerAndOrder(consumerId: number, orderId: number): Promise<Order | null> {
		const order = await this.repository.findOne(
			{ consumer: consumerId, id: orderId },
			{ populate: ['items', 'items.shipment.events.status', 'shippingAddress'] }
		);
		return order;
	}
}
