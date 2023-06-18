import type { EntityRepository, MikroORM, QueryBuilder, SelectQueryBuilder } from '@mikro-orm/mysql';
import { isEmpty } from 'lodash';
import { ProductSpec } from '../entities';
import type { BaseItems } from '../interfaces/BaseItems';
import type { ProductSpecFilters } from '../interfaces/ProductSpecFilters';
import type { ProductSpecOptions } from '../interfaces/ProductSpecOptions';
import { paginate } from '../utils/paginate';
import { stringSearchType } from '../utils/stringSearchType';

export class ProductSpecGateway {
	private repository: EntityRepository<ProductSpec>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(ProductSpec);
	}

	public async createOrUpdate(productSpec: ProductSpec) {
		return this.repository.persistAndFlush(productSpec);
	}

	public async delete(productSpec: ProductSpec) {
		return this.repository.removeAndFlush(productSpec);
	}

	public async findAll(
		filter?: ProductSpecFilters,
		options?: ProductSpecOptions
	): Promise<BaseItems<ProductSpec> | { minPrice: number; maxPrice: number }> {
		const pagination = paginate(options);
		const qb: QueryBuilder<ProductSpec> = this.repository.createQueryBuilder('spec').select('*');

		if (filter?.categoryId) {
			// Number() to prevent SQL injection
			const categoryId = Number(filter.categoryId);

			void qb.leftJoin('spec.categories', 'specCategory').andWhere(`
			(specCategory.category_id = ${categoryId} OR
			specCategory.category_id IN
				(select category.parent_id
				 from (select *
					   from category c
					   order by parent_id, id) category,
					  (select @pv := '${categoryId}') initialisation
				 where find_in_set(parent_id, @pv) > 0
						   and @pv := concat(@pv, ',', category.id)))
			`);
		}

		if (filter?.minPrice) {
			void qb.leftJoin('spec.producerProducts', 'producerProduct').andWhere({
				'producerProduct.current_price': { $gte: filter.minPrice }
			});
		}

		if (filter?.maxPrice) {
			void qb.leftJoin('spec.producerProducts', 'producerProduct').andWhere({
				'producerProduct.current_price': { $lte: filter.maxPrice }
			});
		}

		if (filter?.search) {
			void qb.andWhere({
				$or: [
					{ 'lower(spec.name)': { $like: stringSearchType(filter.search) } },
					{ 'lower(spec.description)': { $like: stringSearchType(filter.search) } }
				]
			});
		}

		if (filter?.fields && !isEmpty(filter.fields)) {
			void qb.leftJoin('spec.categories', 'specCategory').leftJoin('specCategory.fields', 'specField');

			for (const [fieldId, values] of Object.entries(filter.fields)) {
				void qb.andWhere({ 'specField.value': { $in: values }, 'specField.field_id': fieldId });
			}
		}

		// Calculate items count before grouping and paginating
		const miscQb = qb
			.clone()
			.select('COUNT(*) as totalItems')
			.addSelect('MIN(producerProduct.current_price) as minPrice')
			.addSelect('MAX(producerProduct.current_price) as maxPrice')
			.leftJoin('spec.producerProducts', 'producerProduct') as unknown as SelectQueryBuilder<{
			totalItems: number;
			minPrice: number;
			maxPrice: number;
		}>;

		// Add producers count, min and max price
		void qb
			.leftJoinAndSelect('spec.images', 'image')
			.leftJoin('spec.producerProducts', 'producerProduct')
			.groupBy(['spec.id', 'image.id'])
			.addSelect('COUNT(producerProduct.producer_id) as producersCount')
			.addSelect('MIN(producerProduct.current_price) as minPrice')
			.addSelect('MAX(producerProduct.current_price) as maxPrice');

		// Paginate
		void qb.offset(pagination.offset).limit(pagination.limit);

		// Fetch results and map them
		const [miscData, productSpecs] = await Promise.all([miscQb.execute('get'), qb.getResultList()]);
		console.log('\n\n\n\n\n\n', qb.getQuery(), '\n\n\n\n\n\n');

		const totalPages = Math.ceil(miscData.totalItems / pagination.limit);
		const page = Math.ceil(pagination.offset / pagination.limit) + 1;
		return {
			items: productSpecs,
			totalItems: miscData.totalItems,
			totalPages,
			page,
			pageSize: productSpecs.length,
			maxPrice: miscData.maxPrice,
			minPrice: miscData.minPrice
		};
	}

	public async findById(id: number): Promise<ProductSpec | null> {
		return this.repository
			.createQueryBuilder('spec')
			.select('*')
			.where({ id })
			.leftJoinAndSelect('spec.images', 'image')
			.leftJoin('spec.producerProducts', 'producerProduct')
			.groupBy(['spec.id', 'image.id'])
			.addSelect('COUNT(producerProduct.producer_id) as producersCount')
			.addSelect('MIN(producerProduct.current_price) as minPrice')
			.addSelect('MAX(producerProduct.current_price) as maxPrice')
			.getSingleResult();
	}

	public async findSimpleById(id: number): Promise<ProductSpec | null> {
		return this.repository.findOne(id);
	}
}
