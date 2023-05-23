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

	public async findAllByProducerId(producerId: number, options: PaginatedOptions): Promise<BaseItems<Carrier>> {
		const paginataion = paginate(options);
		const [carriers, totalResults] = await Promise.all([
			this.repository.find(
				{ productionUnit: { producer: { user: producerId } } },
				{
					populate: ['productionUnit'],
					limit: paginataion.limit,
					offset: paginataion.offset
				}
			),
			this.repository.count({ productionUnit: { producer: { user: producerId } } })
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
			{ productionUnit: { producer: { user: producerId } }, id: carrierId },
			{ populate: ['productionUnit', 'productionUnit.address', 'shipments.events', 'shipments.events.address'] }
		);

		return carrier;
	}

	public async createOrUpdate(carrier: Carrier): Promise<Carrier> {
		await this.repository.persistAndFlush(carrier);
		return carrier;
	}
}
