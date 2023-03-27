import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Producer } from '../entities';
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

	public async findFromProductSpecId(
		id: number,
		options: PaginatedOptions
	): Promise<{ items: Producer[]; page: number; pageSize: number; totalItems: number; totalPages: number }> {
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
			pageSize: pagination.limit
		};
	}
}
