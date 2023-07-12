import { Carrier } from '../entities';
import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import type { BaseItems } from '../interfaces/BaseItems';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';
import type { CarrierFilters } from '../interfaces/CarrierFilters';
import { stringSearchType } from '../utils/stringSearchType';

export class CarrierGateway {
	private repository: EntityRepository<Carrier>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Carrier);
	}

	public async findFromProductionUnit(filters: CarrierFilters, options: PaginatedOptions): Promise<BaseItems<Carrier>> {
		const paginataion = paginate(options);
		const qb = this.repository
			.createQueryBuilder('c')
			.select('*')
			.where({ productionUnit: { id: filters.productionUnitId }, deletedAt: null })
			.leftJoinAndSelect('c.image', 'ci');

		if (filters.status) {
			void qb.andWhere({ status: filters.status });
		}

		if (filters.search) {
			void qb.andWhere({ licensePlate: { $like: stringSearchType(filters.search) } });
		}

		const totalItemsQb = qb.clone();

		// Order & Paginate
		void qb.orderBy({ licensePlate: 'ASC' }).offset(paginataion.offset).limit(paginataion.limit);

		// Fetch results and map them
		const [totalResults, carriers] = await Promise.all([totalItemsQb.getCount(), qb.getResultList()]);

		return {
			items: carriers,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / paginataion.limit),
			page: Math.ceil(paginataion.offset / paginataion.limit) + 1,
			pageSize: carriers.length
		};
	}

	public async findAllByProducerId(producerId: number, options: PaginatedOptions): Promise<BaseItems<Carrier>> {
		const paginataion = paginate(options);
		const [carriers, totalResults] = await Promise.all([
			this.repository.find(
				{ productionUnit: { producer: { user: producerId } }, deletedAt: null },
				{
					populate: ['productionUnit'],
					limit: paginataion.limit,
					offset: paginataion.offset,
					orderBy: { licensePlate: 'ASC' }
				}
			),
			this.repository.count({ productionUnit: { producer: { user: producerId } }, deletedAt: null })
		]);

		return {
			items: carriers,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / paginataion.limit),
			page: Math.ceil(paginataion.offset / paginataion.limit) + 1,
			pageSize: carriers.length
		};
	}

	public async findOneOfProducer(producerId: number, carrierId: number): Promise<Carrier | null> {
		const carrier = await this.repository.findOne(
			{ productionUnit: { producer: { user: producerId } }, id: carrierId, deletedAt: null },
			{ populate: ['productionUnit', 'productionUnit.address', 'shipments.events', 'shipments.events.address'] }
		);

		return carrier;
	}

	public async createOrUpdate(carrier: Carrier): Promise<Carrier> {
		await this.repository.persistAndFlush(carrier);
		return carrier;
	}
}
