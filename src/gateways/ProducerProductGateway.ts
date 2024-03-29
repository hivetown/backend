import type { EntityRepository, MikroORM, QueryBuilder } from '@mikro-orm/mysql';
import { ProducerProduct } from '../entities';
import type { BaseItems } from '../interfaces/BaseItems';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';
import type { ProducerProductFilters } from '../interfaces/ProducerProductFilters';
import type { ProducerProductOptions } from '../interfaces/ProducerProductOptions';
import { stringSearchType } from '../utils/stringSearchType';

export class ProducerProductGateway {
	private repository: EntityRepository<ProducerProduct>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(ProducerProduct);
	}

	public async createOrUpdate(producerProduct: ProducerProduct) {
		return this.repository.persistAndFlush(producerProduct);
	}

	public async delete(producerProduct: ProducerProduct) {
		return this.repository.removeAndFlush(producerProduct);
	}

	// Pesquisa o produto pelo id dele mesmo
	public async findById(id: number): Promise<ProducerProduct | null> {
		const product = await this.repository.findOne(id, { populate: ['producer', 'productionUnit', 'productSpec'] });
		return product;
	}

	// Pesquisa produtos por id de uma ProductSpec
	public async findBySpecificationId(filters: ProducerProductFilters, options: PaginatedOptions): Promise<BaseItems<ProducerProduct>> {
		const pagination = paginate(options);
		// const [products, totalResults] = await Promise.all([
		// 	this.repository.find(
		// 		{ productSpec: filters.productSpecId },
		// 		{ populate: ['producer', 'productionUnit'], limit: pagination.limit, offset: pagination.offset }
		// 	),
		// 	this.repository.count({ productSpec: filters.productSpecId })
		// ]);

		const qb = this.repository
			.createQueryBuilder('pp')
			.select('*')
			.where({ productSpec: { id: filters.productSpecId }, deletedAt: null })
			.leftJoinAndSelect('pp.producer', 'p')
			.leftJoinAndSelect('p.user', 'u')
			.leftJoinAndSelect('u.image', 'ui')
			.leftJoinAndSelect('pp.productionUnit', 'pu')
			.leftJoin('pu.address', 'pa');

		if (filters.producerId) {
			void qb.andWhere({ producer: { id: filters.producerId } });
		}

		if (filters.productionUnitId) {
			void qb.andWhere({ productionUnit: { id: filters.productionUnitId } });
		}

		if (filters.raio && filters.consumerAddress) {
			const { consumerAddress } = filters;

			void qb.andWhere(
				`(2 * 6371 * ASIN( SQRT( POWER(SIN((RADIANS(pa.latitude) - RADIANS(?)) / 2), 2) + COS(RADIANS(?)) * COS(RADIANS(pa.latitude)) * POWER(SIN((RADIANS(pa.longitude) - RADIANS(?)) / 2), 2)) ) ) <= ?`,
				[consumerAddress!.latitude, consumerAddress!.latitude, consumerAddress!.longitude, filters.raio]
			);
		}

		const totalItemsQb = qb.clone();

		// Order & Paginate
		void qb.orderBy({ currentPrice: 'ASC' }).offset(pagination.offset).limit(pagination.limit);

		// Fetch results and map them
		const [totalResults, products] = await Promise.all([totalItemsQb.getCount(), qb.getResultList()]);

		return {
			items: products,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: products.length
		};
	}

	public async findOneBySpecificationId(specId: number, producerProductId: number): Promise<ProducerProduct | null> {
		const product = await this.repository.findOne(
			{ productSpec: specId, id: producerProductId },
			{ populate: ['producer', 'productionUnit', 'productionUnit.address', 'productSpec'] }
		);
		return product;
	}

	public async findFromProductionUnit(productionUnitId: number, options: ProducerProductOptions): Promise<BaseItems<ProducerProduct> | null> {
		const pagination = paginate(options);

		const qb = this.repository
			.createQueryBuilder('producerProduct')
			.select('*')
			.where({ productionUnit: { id: productionUnitId } })
			.andWhere('producerProduct.deleted_at is null');

		const totalItemsQb = qb.clone();

		// Order & Paginate
		void qb.orderBy({ 'producerProduct_productSpec.name': 'ASC' }).offset(pagination.offset).limit(pagination.limit);

		// Populate
		if (options?.populate) {
			options.populate.forEach((field) => {
				void qb.leftJoinAndSelect(field, field.replaceAll('.', '_'));
			});
		}

		// Fetch results and map them
		const [totalItems, productionUnits] = await Promise.all([totalItemsQb.getCount(), qb.getResultList()]);

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

	// para dar update no stock do produto
	public async updateProduct(product: ProducerProduct): Promise<ProducerProduct> {
		await this.repository.persistAndFlush(product);
		return product;
	}

	public async findAll(
		filter?: ProducerProductFilters,
		options?: ProducerProductOptions
	): Promise<{ items: ProducerProduct[]; totalItems: number; totalPages: number; page: number; pageSize: number }> {
		const pagination = paginate(options);
		const qb: QueryBuilder<ProducerProduct> = this.repository
			.createQueryBuilder('producerProduct')
			.select('*')
			.where('producerProduct.deleted_at is null');

		if (filter?.producerId) {
			void qb.leftJoin('producerProduct.producer', 'producer').andWhere({ 'producer.id': filter.producerId });
		}

		if (filter?.productionUnitId) {
			void qb.leftJoin('producerProduct.productionUnit', 'productionUnit').andWhere({ 'productionUnit.id': filter.productionUnitId });
		}

		if (filter?.search) {
			void qb.andWhere({
				$or: [
					{ 'lower(producerProduct_productSpec.name)': { $like: stringSearchType(filter.search) } },
					{ 'lower(producerProduct_productSpec.description)': { $like: stringSearchType(filter.search) } }
				]
			});
		}

		// Calculate items count before grouping and paginating
		const totalItemsQb = qb.clone();

		// Order
		switch (options?.orderBy) {
			case 'currentPrice':
				void qb.orderBy({ currentPrice: 'ASC' });
				break;
			case 'name':
			default:
				void qb.orderBy({ 'producerProduct_productSpec.name': 'ASC' });
		}

		// Paginate
		void qb.offset(pagination.offset).limit(pagination.limit);

		// Populate
		if (options?.populate) {
			options.populate.forEach((field) => {
				void qb.leftJoinAndSelect(field, field.replaceAll('.', '_'));
			});
		}

		// Fetch results and map them
		const [totalItems, producerProducts] = await Promise.all([totalItemsQb.getCount(), qb.getResultList()]);

		const totalPages = Math.ceil(totalItems / pagination.limit);
		const page = Math.ceil(pagination.offset / pagination.limit) + 1;
		return { items: producerProducts, totalItems, totalPages, page, pageSize: pagination.limit };
	}

	public async update(ProducerProduct: ProducerProduct): Promise<ProducerProduct> {
		await this.repository.persistAndFlush(ProducerProduct);
		return ProducerProduct;
	}
}
