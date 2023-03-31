import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { OrderItem } from '../entities';

export class OrderItemGateway {
	private repository: EntityRepository<OrderItem>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(OrderItem);
	}

	public async findOrdersByProducer(producerId: number): Promise<OrderItem[]> {
		const orderIds = await this.repository
			.createQueryBuilder('oi')
			.select('oi.order_id', true)
			.leftJoin('oi.producerProduct', 'pp')
			.where(`oi.producer_product_id = pp.id and pp.producer_id = '${producerId}'`)
			.getResult();

		return orderIds;
	}

	public async findOrderByProducerAndOrderId(producerId: number, orderId: number): Promise<OrderItem | null> {
		const orderItem = await this.repository.findOne({ order: orderId, producerProduct: { producer: producerId } });
		return orderItem;
	}
}
