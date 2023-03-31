import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Order } from '../entities';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import type { BaseItems } from '../interfaces/BaseItems';
import { paginate } from '../utils/paginate';

export class OrderGateway {
	private repository: EntityRepository<Order>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Order);
	}

	public async findById(orderId: number): Promise<Order | null> {
		const order = await this.repository.findOne(orderId);
		return order;
	}

	public async findByConsumer(consumerId: number, options: PaginatedOptions): Promise<BaseItems<Order>> {
		const pagination = paginate(options);
		const [orders, totalResults] = await Promise.all([
			this.repository.find({ consumer: consumerId }, { fields: ['shippingAddress'], limit: pagination.limit, offset: pagination.offset }),
			this.repository.count({ consumer: consumerId })
		]);

		return {
			items: orders,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: orders.length
		};
	}

	public async findByConsumerAndOrder(consumerId: number, orderId: number): Promise<Order | null> {
		const order = await this.repository.findOne(
			{ consumer: consumerId, id: orderId },
			{ populate: ['items', 'items.shipment.events.status', 'shippingAddress'] }
		);
		return order;
	}
}
