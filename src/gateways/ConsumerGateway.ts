import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Consumer } from '../entities';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';
import type { BaseItems } from '../interfaces/BaseItems';
import { SOFT_DELETABLE_FILTER } from 'mikro-orm-soft-delete';

export class ConsumerGateway {
	private repository: EntityRepository<Consumer>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Consumer);
	}

	public async create(consumer: Consumer): Promise<Consumer> {
		const data = this.repository.create(consumer);
		console.log(data);
		await this.repository.persistAndFlush(data);
		return consumer;
	}

	public async findById(id: number): Promise<Consumer | null> {
		const consumer = await this.repository.findOne({ user: id }, { populate: ['user.role'] });
		return consumer;
	}

	public async findByAuthId(authId: string): Promise<Consumer | null> {
		const consumer = await this.repository.findOne({ user: { authId } }, { populate: ['user.role'] });
		return consumer;
	}

	public async findAll(options: PaginatedOptions): Promise<BaseItems<Consumer>> {
		const pagination = paginate(options);
		const [consumers, totalResults] = await Promise.all([
			this.repository.find({}, { limit: pagination.limit, offset: pagination.offset, orderBy: { user: { name: 'ASC' } } }),
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
		const consumer = await this.repository.findOne({ user: id }, { populate: ['cartItems'] });
		return consumer;
	}

	public async findByIdWithCartAndProducts(id: number): Promise<Consumer | null> {
		const consumer = await this.repository.findOne({ user: id }, { populate: ['cartItems', 'cartItems.producerProduct', 'addresses'] });
		return consumer;
	}

	public async update(consumer: Consumer): Promise<Consumer> {
		await this.repository.persistAndFlush(consumer);
		return consumer;
	}

	public async findByIdWithAddress(id: number): Promise<Consumer | null> {
		const consumer = await this.repository.findOne({ user: id }, { populate: ['addresses'] });
		return consumer;
	}

	public async delete(consumer: Consumer): Promise<void> {
		await this.repository.removeAndFlush(consumer);
	}

	public async findByIdWithDeletedAt(id: number): Promise<Consumer | null> {
		const consumer = await this.repository.findOne({ user: id }, { filters: { [SOFT_DELETABLE_FILTER]: false } });
		return consumer;
	}

	public async findAllWithDeletedAt(options: PaginatedOptions): Promise<BaseItems<Consumer>> {
		const pagination = paginate(options);
		const [consumers, totalResults] = await Promise.all([
			this.repository.find(
				{},
				{
					filters: { [SOFT_DELETABLE_FILTER]: false },
					limit: pagination.limit,
					offset: pagination.offset,
					orderBy: { user: { name: 'ASC' } }
				}
			),
			this.repository.count({}, { filters: { [SOFT_DELETABLE_FILTER]: false } })
		]);

		return {
			items: consumers,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: consumers.length
		};
	}

	public async findByIdWithDeletedAtAndAddress(id: number): Promise<Consumer | null> {
		const consumer = await this.repository.findOne({ user: id }, { filters: { [SOFT_DELETABLE_FILTER]: false }, populate: ['addresses'] });
		return consumer;
	}
}
