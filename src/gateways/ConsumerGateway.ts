import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Consumer } from '../entities';

export class ConsumerGateway {
	private repository: EntityRepository<Consumer>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Consumer);
	}

	public async findAll(): Promise<Consumer[]> {
		const consumers = await this.repository.findAll();
		return consumers;
	}

	public async findByIdWithCart(id: number): Promise<Consumer | null> {
		const consumer = await this.repository.findOne(id, { populate: ['cartItems', 'cartItems.product', 'cartItems.product.productSpec'] });
		return consumer;
	}
}
