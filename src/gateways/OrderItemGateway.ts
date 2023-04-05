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

	public async findByProducerAndOrderId(producerId: number, orderId: number, options: PaginatedOptions): Promise<BaseItems<OrderItem>> {
		const pagination = paginate(options);

		const [orderItems, totalResults] = await Promise.all([
			this.repository.find(
				{ order: orderId, producerProduct: { producer: producerId } },
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
			this.repository.count({ order: orderId, producerProduct: { producer: producerId } })
		]);
		return {
			items: orderItems,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: orderItems.length
		};
	}

	public async findByProducerAndOrderAndProducerProduct(producerId: number, orderId: number, producerProductId: number): Promise<OrderItem | null> {
		const orderItem = await this.repository.findOne(
			{ order: orderId, producerProduct: { producer: producerId, id: producerProductId } },
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
		return orderItem;
	}

	public async findByProducerAndOrderAndProducerProductWithShipment(
		producerId: number,
		orderId: number,
		producerProductId: number
	): Promise<OrderItem | null> {
		const orderItem = await this.repository.findOne(
			{ order: orderId, producerProduct: { producer: producerId, id: producerProductId } },
			{ populate: ['shipment', 'shipment.carrier', 'shipment.events.address'] }
		);
		return orderItem;
	}
}
