import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { OrderItem } from '../entities';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import type { BaseItems } from '../interfaces/BaseItems';
import { paginate } from '../utils/paginate';
import { SOFT_DELETABLE_FILTER } from 'mikro-orm-soft-delete';

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

	public async findOrdersByProducerPopulated(producerId: number): Promise<OrderItem[]> {
		const orderIds = await this.repository.find(
			{ producerProduct: { producer: { user: producerId } } },
			{
				populate: [
					'producerProduct.productionUnit.address',
					'order.shippingAddress',
					'producerProduct.productSpec',
					'producerProduct.productSpec.categories',
					'producerProduct.productSpec.categories.category',
					'shipment.events.status',
					'order.items',
					'order.consumer',
					'order.consumer.user'
				]
			}
		);

		return orderIds;
	}

	public async findOrderByProducerAndOrderId(producerId: number, orderId: number): Promise<OrderItem | null> {
		const orderItem = await this.repository.findOne({ order: orderId, producerProduct: { producer: { user: producerId } } });
		return orderItem;
	}

	public async findByProducerAndOrderId(producerId: number, orderId: number, options: PaginatedOptions): Promise<BaseItems<OrderItem>> {
		const pagination = paginate(options);

		const [orderItems, totalResults] = await Promise.all([
			this.repository.find(
				{ order: orderId, producerProduct: { producer: { user: producerId } } },
				{
					populate: [
						'producerProduct',
						'producerProduct.producer',
						'producerProduct.productionUnit',
						'producerProduct.productSpec',
						'shipment.events.status'
					],
					limit: pagination.limit,
					offset: pagination.offset
				}
			),
			this.repository.count({ order: orderId, producerProduct: { producer: { user: producerId } } })
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
			{ order: orderId, producerProduct: { producer: { user: producerId }, id: producerProductId } },
			{
				populate: ['producerProduct', 'producerProduct.producer', 'producerProduct.productionUnit', 'producerProduct.productSpec']
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
			{ order: orderId, producerProduct: { producer: { user: producerId }, id: producerProductId } },
			{ populate: ['shipment', 'shipment.carrier', 'shipment.events.address'] }
		);
		return orderItem;
	}

	public async findByConsumerIDAndOrderId(consumerId: number, orderId: number, options: PaginatedOptions): Promise<BaseItems<OrderItem>> {
		const pagination = paginate(options);
		const [orderItems, totalResults] = await Promise.all([
			this.repository.find(
				{ order: { id: orderId, consumer: { user: consumerId } } },
				{
					populate: [
						'producerProduct',
						'producerProduct.producer',
						'producerProduct.productionUnit',
						'producerProduct.productSpec',
						'shipment.events.status'
					],
					limit: pagination.limit,
					offset: pagination.offset,
					filters: { [SOFT_DELETABLE_FILTER]: false }
				}
			),
			this.repository.count({ order: { id: orderId, consumer: { user: consumerId } } })
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
			{ order: { id: orderId, consumer: { user: consumerId } }, producerProduct: { id: producerProductId } },
			{
				populate: ['producerProduct', 'producerProduct.producer', 'producerProduct.productionUnit', 'producerProduct.productSpec'],
				filters: { [SOFT_DELETABLE_FILTER]: false }
			}
		);
		return q2;
	}

	public async findByProducerIdPopulated(producerId: number): Promise<OrderItem[]> {
		const products = await this.repository.find(
			{ producerProduct: { producer: { user: producerId } } },
			{
				populate: ['shipment', 'shipment.events', 'shipment.events.status']
			}
		);
		return products;
	}

	public async findAllByConsumerId(consumerId: number): Promise<OrderItem[]> {
		const orderItems = await this.repository.find(
			{ order: { consumer: { user: consumerId } } },
			{
				populate: [
					'producerProduct.productionUnit.address',
					'order.shippingAddress',
					'producerProduct.productSpec',
					'producerProduct.productSpec.categories',
					'producerProduct.productSpec.categories.category',
					'shipment.events.status',
					'order.items',
					'order.items.shipment.events.status'
				]
			}
		);
		return orderItems;
	}
}
