import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Producer } from '../entities';
import type { BaseItems } from '../interfaces/BaseItems';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';

export class ProducerGateway {
	private repository: EntityRepository<Producer>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Producer);
	}

	public async findAll(): Promise<Producer[]> {
		const producers = await this.repository.findAll();
		return producers;
	}

	public async create(producer: Producer): Promise<Producer> {
		const data = this.repository.create(producer);
		await this.repository.persistAndFlush(data);
		return producer;
	}

	public async findByAuthId(authId: string): Promise<Producer | null> {
		return this.repository.findOne({ authId });
	}

	public async findFromProductSpecId(id: number, options: PaginatedOptions): Promise<BaseItems<Producer>> {
		const pagination = paginate(options);
		const [producers, totalResults] = await Promise.all([
			await this.repository
				.createQueryBuilder('p')
				.select('p.*', true)
				.leftJoin('p.producerProducts', 'pp')
				.where({ 'pp.product_spec_id': id })
				.limit(pagination.limit)
				.offset(pagination.offset)
				.execute(),
			await this.repository
				.createQueryBuilder('p')
				.select('p.*', true)
				.leftJoin('p.producerProducts', 'pp')
				.where({ 'pp.product_spec_id': id })
				.count()
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
