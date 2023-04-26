import { Carrier } from '../entities';
import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import type { BaseItems } from '../interfaces/BaseItems';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';

export class CarrierGateway {
	private repository: EntityRepository<Carrier>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Carrier);
	}

	public async findAllinTranstit(productionUnitId: number, options: PaginatedOptions): Promise<BaseItems<Carrier>> {
		const pagination = paginate(options);
		const [carriers, totalResults] = await Promise.all([
			this.repository.find(
				{ productionUnit: productionUnitId, status: 'UNAVAILABLE' },
				{
					populate: ['productionUnit'],
					limit: pagination.limit,
					offset: pagination.offset
				}
			),
			this.repository.count({ productionUnit: productionUnitId, status: 'UNAVAILABLE' })
		]);
		return {
			items: carriers,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: carriers.length
		};
	}
}
