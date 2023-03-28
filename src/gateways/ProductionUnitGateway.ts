import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { ProductionUnit } from '../entities';
import type { BaseItems } from '../interfaces/BaseItems';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';

export class ProductionUnitGateway {
	private repository: EntityRepository<ProductionUnit>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(ProductionUnit);
	}

	public async findById(id: number): Promise<ProductionUnit | null> {
		const product = await this.repository.findOne(id, { populate: ['address'] });
		return product;
	}

	public async findFromProducer(producerId: number, options: PaginatedOptions): Promise<BaseItems<ProductionUnit>> {
		const pagination = paginate(options);

		const qb = this.repository
			.createQueryBuilder('pu')
			.select('*')
			.where({ producer: { id: producerId } });

		const totalItemsQb = qb.clone();

		// Paginate
		void qb.offset(pagination.offset).limit(pagination.limit);

		// Fetch results and map them
		const [totalItems, productionUnits] = await Promise.all([
			totalItemsQb.getCount(),
			qb.execute().then((rs) =>
				rs.map((r) => {
					delete r.address.consumer;
					return r;
				})
			)
		]);

		const totalPages = Math.ceil(totalItems / pagination.limit);
		const page = Math.ceil(pagination.offset / pagination.limit) + 1;
		return {
			totalItems,
			items: productionUnits,
			totalPages,
			page,
			pageSize: pagination.limit
		};
	}
}
