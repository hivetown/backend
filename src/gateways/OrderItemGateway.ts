import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { OrderItem } from '../entities';

export class OrderItemGateway {
	private repository: EntityRepository<OrderItem>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(OrderItem);
	}

	public findByConsumerIDAndOrderId(consumerId: number, orderId: number): Promise<OrderItem[]> {
		const q2 = this.repository.find(
			{ order: { id: orderId, consumer: { id: consumerId } } },
			{
				populate: [
					'producerProduct',
					'producerProduct.producer',
					'producerProduct.productionUnit',
					'producerProduct.productSpec',
					'shipment.events.status'
				]
			}
		);
		return q2;
	}

	public findByConsumerIdOrderIdProducerProductId(consumerId: number, orderId: number, producerProductId: number): Promise<OrderItem | null> {
		const q2 = this.repository.findOne(
			{ order: { id: orderId, consumer: { id: consumerId } }, producerProduct: { id: producerProductId } },
			{
				populate: ['producerProduct', 'producerProduct.producer', 'producerProduct.productionUnit', 'producerProduct.productSpec']
			}
		);
		return q2;
	}
}
