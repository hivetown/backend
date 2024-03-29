import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { ProductionUnit } from '../entities';
import type { BaseItems } from '../interfaces/BaseItems';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';
import type { ProductionUnitFilters } from '../interfaces/ProductionUnitFilters';
import { stringSearchType } from '../utils/stringSearchType';

export class ProductionUnitGateway {
	private repository: EntityRepository<ProductionUnit>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(ProductionUnit);
	}

	public async findById(id: number): Promise<ProductionUnit | null> {
		const productionUnit = await this.repository.findOne(id, { populate: ['address'] });
		return productionUnit;
	}

	public async findByIdPopulated(id: number): Promise<ProductionUnit | null> {
		const productionUnit = await this.repository.findOne(id, { populate: ['address', 'producer', 'carriers'] });
		return productionUnit;
	}

	public async findFromProducer(filter: ProductionUnitFilters, options: PaginatedOptions): Promise<BaseItems<ProductionUnit>> {
		const pagination = paginate(options);

		const qb = this.repository
			.createQueryBuilder('pu')
			.select('*')
			.where({ producer: { id: filter.producerId }, deletedAt: null })
			.leftJoinAndSelect('pu.address', 'pa')
			.leftJoinAndSelect('pu.images', 'pi');

		if (filter.search) {
			void qb.andWhere({
				$or: [{ 'lower(pu.name)': { $like: stringSearchType(filter.search) } }]
			});
		}

		if (filter.raio) {
			const consumerAddress = filter.address;

			void qb.andWhere(
				`(2 * 6371 * ASIN( SQRT( POWER(SIN((RADIANS(pa.latitude) - RADIANS(?)) / 2), 2) + COS(RADIANS(?)) * COS(RADIANS(pa.latitude)) * POWER(SIN((RADIANS(pa.longitude) - RADIANS(?)) / 2), 2)) ) ) <= ?`,
				[consumerAddress!.latitude, consumerAddress!.latitude, consumerAddress!.longitude, filter.raio]
			);
		}

		const totalItemsQb = qb.clone();

		// Order & Paginate
		void qb.orderBy({ name: 'ASC' }).offset(pagination.offset).limit(pagination.limit);

		// Fetch results and map them
		const [totalItems, productionUnits] = await Promise.all([totalItemsQb.getCount(), qb.getResultList()]);

		const totalPages = Math.ceil(totalItems / pagination.limit);
		const page = Math.ceil(pagination.offset / pagination.limit) + 1;
		return {
			items: productionUnits,
			totalItems,
			totalPages,
			page,
			pageSize: productionUnits.length
		};
	}

	public async createOrUpdate(productionUnit: ProductionUnit): Promise<ProductionUnit> {
		await this.repository.persistAndFlush(productionUnit);
		await this.repository.populate(productionUnit, ['address']);
		return productionUnit;
	}

	public async delete(productionUnit: ProductionUnit): Promise<void> {
		await this.repository.removeAndFlush(productionUnit);
	}

	public async update(productionUnit: ProductionUnit): Promise<ProductionUnit> {
		await this.repository.persistAndFlush(productionUnit);
		return productionUnit;
	}

	public async findAllFromProductSpec(specId: number, producerId: number): Promise<ProductionUnit[]> {
		const productionUnits = await this.repository.find(
			{
				products: { productSpec: specId },
				producer: { user: producerId }
			},
			{ populate: ['address'], orderBy: { name: 'ASC' } }
		);
		return productionUnits;
	}

	public async findOneFromProducer(producerId: number, productionUnitId: number): Promise<ProductionUnit | null> {
		const productionUnit = await this.repository.findOne({
			id: productionUnitId,
			producer: { user: producerId }
		});
		return productionUnit;
	}
}
