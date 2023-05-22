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
					'order.consumer.user',
					'order.items.shipment.events.status'
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

	public async findAllAdmin(distancia: number, dataInicio: Date, dataFim: Date): Promise<OrderItem[]> {
		const orderItems = await this.repository
			.createQueryBuilder('orderItem')
			.select(['orderItem.orderId', 'orderItem.producerProduct'])
			.leftJoinAndSelect('orderItem.producerProduct', 'producerProduct')
			.leftJoinAndSelect('producerProduct.productionUnit', 'productionUnit')
			.leftJoinAndSelect('productionUnit.address', 'address')
			.leftJoinAndSelect('orderItem.order', 'order')
			.leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
			.leftJoinAndSelect('producerProduct.productSpec', 'productSpec')
			.leftJoinAndSelect('productSpec.categories', 'categories')
			.leftJoinAndSelect('categories.category', 'category')
			.leftJoinAndSelect('orderItem.shipment', 'shipment')
			.leftJoinAndSelect('shipment.events', 'events')
			.leftJoinAndSelect('order.items', 'items')
			.leftJoinAndSelect('items.shipment', 'itemShipment')
			.where(
				` events.date BETWEEN '${dataInicio}' and '${dataFim}' and
					(2 * 6371 * ASIN(
							SQRT(
								POWER(SIN((RADIANS(address.latitude) - RADIANS(shippingAddress.latitude)) / 2), 2) +
								COS(RADIANS(shippingAddress.latitude)) * COS(RADIANS(address.latitude)) *
								POWER(SIN((RADIANS(address.longitude) - RADIANS(shippingAddress.longitude)) / 2), 2)
			)
		)) <= ${distancia}`
			)
			.getResultList();

		// await this.repository.populate(orderItems, ['shipment', 'shipment.events', 'shipment.events.status']);

		return orderItems;
	}

	// ------------------------------ 	  CONTAS PARA O CONSUMIDOR 	--------------------------------------------

	public async findAllByConsumerIdNovo(consumerId: number, distancia: number): Promise<OrderItem[]> {
		const orderItems = await this.repository
			.createQueryBuilder('orderItem')
			.leftJoinAndSelect('orderItem.producerProduct', 'producerProduct')
			.leftJoinAndSelect('producerProduct.productionUnit', 'productionUnit')
			.leftJoinAndSelect('productionUnit.address', 'address')
			.leftJoinAndSelect('orderItem.order', 'order')
			.leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
			.leftJoinAndSelect('producerProduct.productSpec', 'productSpec')
			.leftJoinAndSelect('productSpec.categories', 'categories')
			.leftJoinAndSelect('categories.category', 'category')
			.leftJoinAndSelect('orderItem.shipment', 'shipment')
			.leftJoinAndSelect('shipment.events', 'events')
			.leftJoinAndSelect('order.items', 'items')
			.leftJoinAndSelect('items.shipment', 'itemShipment')
			.where(
				`order.consumer_id = ${consumerId} and (2 * 6371 * ASIN(
					SQRT(
						POWER(SIN((RADIANS(address.latitude) - RADIANS(shippingAddress.latitude)) / 2), 2) +
						COS(RADIANS(shippingAddress.latitude)) * COS(RADIANS(address.latitude)) *
						POWER(SIN((RADIANS(address.longitude) - RADIANS(shippingAddress.longitude)) / 2), 2)
					)
				)) <= ${distancia}`
			)
			.getResultList();

		await this.repository.populate(orderItems, ['shipment', 'shipment.events', 'shipment.events.status']);

		return orderItems;
	}

	public async findAllByConsumerIdNovoCategory(consumerId: number, distancia: number, categoryId: number): Promise<OrderItem[]> {
		const orderItems = await this.repository
			.createQueryBuilder('orderItem')
			.leftJoinAndSelect('orderItem.producerProduct', 'producerProduct')
			.leftJoinAndSelect('producerProduct.productionUnit', 'productionUnit')
			.leftJoinAndSelect('productionUnit.address', 'address')
			.leftJoinAndSelect('orderItem.order', 'order')
			.leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
			.leftJoinAndSelect('producerProduct.productSpec', 'productSpec')
			.leftJoinAndSelect('productSpec.categories', 'categories')
			.leftJoinAndSelect('categories.category', 'category')
			.leftJoinAndSelect('orderItem.shipment', 'shipment')
			.leftJoinAndSelect('shipment.events', 'events')
			.leftJoinAndSelect('order.items', 'items')
			.leftJoinAndSelect('items.shipment', 'itemShipment')
			.where(
				`order.consumer_id = ${consumerId} and (2 * 6371 * ASIN(
					SQRT(
						POWER(SIN((RADIANS(address.latitude) - RADIANS(shippingAddress.latitude)) / 2), 2) +
						COS(RADIANS(shippingAddress.latitude)) * COS(RADIANS(address.latitude)) *
						POWER(SIN((RADIANS(address.longitude) - RADIANS(shippingAddress.longitude)) / 2), 2)
					)
				)) <= ${distancia} and ${categoryId} in (categories.category_id)`
			)
			.getResultList();

		await this.repository.populate(orderItems, ['shipment', 'shipment.events', 'shipment.events.status']);
		return orderItems;
	}

	// ------------------------------ 	  CONTAS PARA O PRODUTOR 	--------------------------------------------

	public async findAllByProducerIdCategory(producerId: number, distancia: number, categoryId: number): Promise<OrderItem[]> {
		const orderItems = await this.repository
			.createQueryBuilder('orderItem')
			.leftJoinAndSelect('orderItem.producerProduct', 'producerProduct')
			.leftJoinAndSelect('producerProduct.productionUnit', 'productionUnit')
			.leftJoinAndSelect('productionUnit.address', 'address')
			.leftJoinAndSelect('orderItem.order', 'order')
			.leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
			.leftJoinAndSelect('producerProduct.productSpec', 'productSpec')
			.leftJoinAndSelect('productSpec.categories', 'categories')
			.leftJoinAndSelect('categories.category', 'category')
			.leftJoinAndSelect('orderItem.shipment', 'shipment')
			.leftJoinAndSelect('shipment.events', 'events')
			.leftJoinAndSelect('order.items', 'items')
			.leftJoinAndSelect('items.shipment', 'itemShipment')
			.leftJoinAndSelect('producerProduct.producer', 'producer')
			.where(
				`producer.id = ${producerId} and (2 * 6371 * ASIN(
					SQRT(
						POWER(SIN((RADIANS(address.latitude) - RADIANS(shippingAddress.latitude)) / 2), 2) +
						COS(RADIANS(shippingAddress.latitude)) * COS(RADIANS(address.latitude)) *
						POWER(SIN((RADIANS(address.longitude) - RADIANS(shippingAddress.longitude)) / 2), 2)
					)
				)) <= ${distancia} and ${categoryId} in (categories.category_id)`
			)
			.getResultList();
		await this.repository.populate(orderItems, ['shipment', 'shipment.events', 'shipment.events.status']);
		return orderItems;
	}

	public async findAllByProducerId(producerId: number, distancia: number): Promise<OrderItem[]> {
		const orderItems = await this.repository
			.createQueryBuilder('orderItem')
			.leftJoinAndSelect('orderItem.producerProduct', 'producerProduct')
			.leftJoinAndSelect('producerProduct.productionUnit', 'productionUnit')
			.leftJoinAndSelect('productionUnit.address', 'address')
			.leftJoinAndSelect('orderItem.order', 'order')
			.leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
			.leftJoinAndSelect('producerProduct.productSpec', 'productSpec')
			.leftJoinAndSelect('productSpec.categories', 'categories')
			.leftJoinAndSelect('categories.category', 'category')
			.leftJoinAndSelect('orderItem.shipment', 'shipment')
			.leftJoinAndSelect('shipment.events', 'events')
			.leftJoinAndSelect('order.items', 'items')
			.leftJoinAndSelect('items.shipment', 'itemShipment')
			.leftJoinAndSelect('producerProduct.producer', 'producer')
			.where(
				`producer.id = ${producerId} and (2 * 6371 * ASIN(
					SQRT(
						POWER(SIN((RADIANS(address.latitude) - RADIANS(shippingAddress.latitude)) / 2), 2) +
						COS(RADIANS(shippingAddress.latitude)) * COS(RADIANS(address.latitude)) *
						POWER(SIN((RADIANS(address.longitude) - RADIANS(shippingAddress.longitude)) / 2), 2)
					)
				)) <= ${distancia}`
			)
			.getResultList();
		await this.repository.populate(orderItems, ['shipment', 'shipment.events', 'shipment.events.status']);
		return orderItems;
	}
}
