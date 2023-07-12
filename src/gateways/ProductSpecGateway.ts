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
		const qb: QueryBuilder<ProductSpec> = this.repository
			.createQueryBuilder('spec')
			.select('*')
			.leftJoin('spec.producerProducts', 'producerProduct');

		// Calculate items count before grouping and paginating
		const miscQb = qb
			.clone()
			.select('COUNT(DISTINCT spec.id) as totalItems')
			.addSelect('MIN(producerProduct.current_price) as minPrice')
			.addSelect('MAX(producerProduct.current_price) as maxPrice') as unknown as SelectQueryBuilder<{
			totalItems: number;
			minPrice: number;
			maxPrice: number;
		}>;

		const innerWheres = [];
		const innerWheresValues = [];
		const innerLeftJoins = [];
		if (filter?.categoryId) {
			innerLeftJoins.push(`left join product_spec_category as specCategory on spec.id = specCategory.product_spec_id`);
			void miscQb.leftJoin('spec.categories', 'specCategory');
			innerWheres.push(`
			(specCategory.category_id = ? OR
			specCategory.category_id IN
				(select category.parent_id
				 from (select *
					   from category c
					   order by parent_id, id) category,
					  (select @pv := '?') initialisation
				 where find_in_set(parent_id, @pv) > 0
						   and @pv := concat(@pv, ',', category.id)))
			`);
			innerWheresValues.push(filter.categoryId, filter.categoryId);
		}

		let hasProducerProductLeftJoin = false;
		if (filter?.minPrice) {
			hasProducerProductLeftJoin = true;
			void miscQb.leftJoin('spec.producerProducts', 'producerProduct');
			innerLeftJoins.push(`left join producer_product as producerProduct on spec.id = producerProduct.product_spec_id`);
			innerWheres.push(`producerProduct.current_price >= ?`);
			innerWheresValues.push(filter.minPrice);
		}

		if (filter?.maxPrice) {
			if (!hasProducerProductLeftJoin) {
				innerLeftJoins.push(`left join producer_product as producerProduct on spec.id = producerProduct.product_spec_id`);
				void miscQb.leftJoin('spec.producerProducts', 'producerProduct');
			}
			innerWheres.push(`producerProduct.current_price <= ?`);
			innerWheresValues.push(filter.maxPrice);
		}

		if (filter?.search) {
			innerWheres.push(`(lower(spec.name) like ? or lower(spec.description) like ?)`);
			const search = stringSearchType(filter.search);
			innerWheresValues.push(search, search);
		}

		if (filter?.fields && !isEmpty(filter.fields)) {
			// void qb.leftJoin('spec.categories', 'specCategory').leftJoin('specCategory.fields', 'specField');
			// for (const [fieldId, values] of Object.entries(filter.fields)) {
			// 	void qb.andWhere({ 'specField.value': { $in: values }, 'specField.field_id': fieldId });
			// }
		}

		if (innerWheres.length) void miscQb.andWhere(innerWheres.join(' AND '), innerWheresValues);

		// Add producers count, min and max price
		void qb
			.groupBy(['spec.id', 'image.id'])
			.leftJoinAndSelect('spec.images', 'image')
			.addSelect('COUNT(producerProduct.producer_id) as producersCount')
			.addSelect('MIN(producerProduct.current_price) as minPrice')
			.addSelect('MAX(producerProduct.current_price) as maxPrice')
			// Count how many orders the producerProduct has
			.leftJoin('producerProduct.orderItems', 'orderItem')
			.addSelect('SUM(orderItem.quantity) as timesOrdered');

		// ----- Pagination subquery (because we want to LIMIT before grouping)
		// Process the order by
		let innerOrderBy = `spec.name ASC`;
		switch (options?.orderBy) {
			case 'priceAsc':
				// We need to join producerProduct to get the price
				innerLeftJoins.push(
					`left join producer_product as producerProduct
				on spec.id = producerProduct.product_spec_id`
				);

				innerOrderBy = `AVG(producerProduct.current_price) ASC`;

				// Outter order by
				void qb.orderBy({ 'AVG(producerProduct.current_price)': 'ASC' });
				break;
			case 'priceDesc':
				// We need to join producerProduct to get the price
				innerLeftJoins.push(
					`left join producer_product as producerProduct
				on spec.id = producerProduct.product_spec_id`
				);

				innerOrderBy = `AVG(producerProduct.current_price) DESC`;

				// Outter order by
				void qb.orderBy({ 'AVG(producerProduct.current_price)': 'DESC' });
				break;
			case 'popularityAsc':
				// We need to join producerProduct to get the orderItems
				innerLeftJoins.push(
					`left join producer_product as producerProduct
				on spec.id = producerProduct.product_spec_id`
				);
				// We need to join orderItem to get the quantity
				innerLeftJoins.push(`left join order_item as orderItem
				on producerProduct.id = orderItem.producer_product_id`);

				innerOrderBy = `SUM(orderItem.quantity) ASC`;

				// Outter order by
				void qb.orderBy({ 'SUM(orderItem.quantity)': 'ASC' });
				break;
			case 'popularityDesc':
				// We need to join producerProduct to get the orderItems
				innerLeftJoins.push(
					`left join producer_product as producerProduct
				on spec.id = producerProduct.product_spec_id`
				);
				// We need to join orderItem to get the quantity
				innerLeftJoins.push(`left join order_item as orderItem
				on producerProduct.id = orderItem.producer_product_id`);

				innerOrderBy = `SUM(orderItem.quantity) DESC`;

				// Outter order by
				void qb.orderBy({ 'SUM(orderItem.quantity)': 'DESC' });
				break;
			case 'ZA':
				innerOrderBy = `spec.name DESC`;

				// Outter order by
				void qb.orderBy({ 'spec.name': 'DESC' });
				break;
			case 'AZ':
			default:
				innerOrderBy = `spec.name ASC`;

				// Outter order by
				void qb.orderBy({ 'spec.name': 'ASC' });
				break;
		}

		void qb.andWhere(
			`spec.id IN (
			select spec.id
                      from (select spec.id
                            from product_spec as spec
                              ${innerLeftJoins.join(' ')}
							  ${innerWheres.length ? `where ${innerWheres.join(' and ')}` : ''}
                            group by spec.id
                            order by ${innerOrderBy}
                            limit ?, ?) as spec
		)`,
			[...innerWheresValues, pagination.offset, pagination.limit]
		);

		// Fetch results and map them
		const [miscData, productSpecs] = await Promise.all([miscQb.execute('get'), qb.getResultList()]);

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
			.leftJoin('producerProduct.orderItems', 'orderItem')
			.addSelect('SUM(orderItem.quantity) as timesOrdered')
			.getSingleResult();
	}

	public async findSimpleById(id: number): Promise<ProductSpec | null> {
		return this.repository.findOne(id);
	}
}
