import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Producer } from '../entities';
import type { BaseItems } from '../interfaces/BaseItems';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';
import type { ProducerOptions } from '../interfaces/ProducerOptions';
import { SOFT_DELETABLE_FILTER } from 'mikro-orm-soft-delete';

export class ProducerGateway {
	private repository: EntityRepository<Producer>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Producer);
	}

	public async findAll(options: PaginatedOptions): Promise<BaseItems<Producer>> {
		const pagination = paginate(options);
		const [producers, totalResults] = await Promise.all([
			this.repository.find({}, { limit: pagination.limit, offset: pagination.offset }),
			this.repository.count()
		]);

		return {
			items: producers,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: producers.length
		};
	}

	public async create(producer: Producer): Promise<Producer> {
		const data = this.repository.create(producer);
		await this.repository.persistAndFlush(data);
		return producer;
	}

	public async findByIdWithUnits(id: number): Promise<Producer | null> {
		const producer = await this.repository.findOne({ user: id }, { populate: ['productionUnits'] });
		return producer;
	}

	public async findById(id: number, options?: ProducerOptions): Promise<Producer | null> {
		return this.repository.findOne({ user: id }, { populate: options?.populate as any });
	}

	public async findFromProductSpecId(id: number, options: PaginatedOptions): Promise<BaseItems<Producer>> {
		const pagination = paginate(options);
		const [producers, totalResults] = await Promise.all([
			this.repository.find(
				{
					producerProducts: { productSpec: id }
				},
				{
					populate: ['productionUnits'],
					limit: pagination.limit,
					offset: pagination.offset
				}
			),
			this.repository.count({
				producerProducts: { productSpec: id }
			})
		]);

		return {
			items: producers,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: producers.length
		};
	}

	public async delete(producer: Producer): Promise<void> {
		await this.repository.removeAndFlush(producer);
	}

	public async findByIdPopulated(id: number): Promise<Producer | null> {
		return this.repository.findOne({ user: id }, { populate: ['productionUnits', 'producerProducts'] });
	}

	public async findByIdWithDeletedAt(id: number): Promise<Producer | null> {
		const producer = await this.repository.findOne(
			{ user: id },
			{
				populate: ['productionUnits', 'producerProducts'],
				filters: { [SOFT_DELETABLE_FILTER]: false }
			}
		);
		return producer;
	}

	public async update(producer: Producer): Promise<Producer> {
		await this.repository.persistAndFlush(producer);
		return producer;
	}

	public async findAllWithDeletedAt(options: PaginatedOptions): Promise<BaseItems<Producer>> {
		const pagination = paginate(options);
		const [producers, totalResults] = await Promise.all([
			this.repository.find({}, { filters: { [SOFT_DELETABLE_FILTER]: false }, limit: pagination.limit, offset: pagination.offset }),
			this.repository.count({}, { filters: { [SOFT_DELETABLE_FILTER]: false } })
		]);

		return {
			items: producers,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: producers.length
		};
	}
}
