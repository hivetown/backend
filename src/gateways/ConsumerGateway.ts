import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Consumer } from '../entities';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';
import type { BaseItems } from '../interfaces/BaseItems';

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

	public async findAll(options: PaginatedOptions): Promise<BaseItems<Consumer>> {
		const pagination = paginate(options);
		const [consumers, totalResults] = await Promise.all([
			this.repository.find({}, { limit: pagination.limit, offset: pagination.offset }),
			this.repository.count()
		]);

		return {
			items: consumers,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: consumers.length
		};
	}

	public async findByIdWithCart(id: number): Promise<Consumer | null> {
		const consumer = await this.repository.findOne(id, { populate: ['cartItems'] });
		return consumer;
	}

	public async findByIdWithCartAndProducts(id: number): Promise<Consumer | null> {
		const consumer = await this.repository.findOne(id, { populate: ['cartItems', 'cartItems.producerProduct', 'addresses'] });
		return consumer;
	}

	public async updateCart(consumer: Consumer): Promise<Consumer> {
		await this.repository.persistAndFlush(consumer);
		return consumer;
	}
}
