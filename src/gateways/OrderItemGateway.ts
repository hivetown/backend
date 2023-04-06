import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { OrderItem } from '../entities';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import type { BaseItems } from '../interfaces/BaseItems';
import { paginate } from '../utils/paginate';

export class OrderItemGateway {
	private repository: EntityRepository<OrderItem>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(OrderItem);
	}

	public async findByConsumerIDAndOrderId(consumerId: number, orderId: number, options: PaginatedOptions): Promise<BaseItems<OrderItem>> {
		const pagination = paginate(options);
		const [orderItems, totalResults] = await Promise.all([
			this.repository.find(
				{ order: { id: orderId, consumer: { id: consumerId } } },
				{
					populate: [
						'producerProduct',
						'producerProduct.producer',
						'producerProduct.productionUnit',
						'producerProduct.productSpec',
						'producerProduct.productSpec.images',
						'shipment.events.status'
					],
					limit: pagination.limit,
					offset: pagination.offset
				}
			),
			this.repository.count({ order: { id: orderId, consumer: { id: consumerId } } })
		]);

		return {
			items: orderItems,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: orderItems.length
		};
	}

	public async findByConsumerIdOrderIdProducerProductId(consumerId: number, orderId: number, producerProductId: number): Promise<OrderItem | null> {
		const q2 = await this.repository.findOne(
			{ order: { id: orderId, consumer: { id: consumerId } }, producerProduct: { id: producerProductId } },
			{
				populate: [
					'producerProduct',
					'producerProduct.producer',
					'producerProduct.productionUnit',
					'producerProduct.productSpec',
					'producerProduct.productSpec.images'
				]
			}
		);
		return q2;
	}
}
