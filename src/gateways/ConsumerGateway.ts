import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Consumer } from '../entities';

export class ConsumerGateway {
	private repository: EntityRepository<Consumer>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Consumer);
	}

	public async create(consumer: Consumer): Promise<Consumer> {
		const data = this.repository.create(consumer);
		await this.repository.persistAndFlush(data);
		return consumer;
	}

	public async findByAuthId(authId: string): Promise<Consumer | null> {
		return this.repository.findOne({ authId });
	}

	public async findById(id: number): Promise<Consumer | null> {
		const consumer = await this.repository.findOne(id);
		return consumer;
	}

	public async findAll(): Promise<Consumer[]> {
		const consumers = await this.repository.findAll();
		return consumers;
	}

	public async findByIdWithCart(id: number): Promise<Consumer | null> {
		const consumer = await this.repository.findOne(id, { populate: ['cartItems'] });
		return consumer;
	}

	public async findByIdWithCartAndProducts(id: number): Promise<Consumer | null> {
		const consumer = await this.repository.findOne(id, { populate: ['cartItems', 'cartItems.producerProduct'] });
		return consumer;
	}

	public async updateCart(consumer: Consumer): Promise<Consumer> {
		await this.repository.persistAndFlush(consumer);
		return consumer;
	}

	public async deleteCart(consumer: Consumer): Promise<Consumer> {
		for (const item of consumer.cartItems.getItems()) {
			await this.repository.remove(item);
		}
		await this.repository.persistAndFlush(consumer);
		return consumer;
	}
}
