import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Cart } from '../entities';

export class CartGateway {
	private repository: EntityRepository<Cart>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Cart);
	}

	public async findByConsumerId(consumerId: number): Promise<Cart | null> {
		const cart = await this.repository.findOne(consumerId);
		return cart;
	}
}
