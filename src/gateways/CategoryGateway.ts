import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Category } from '../entities';
import type { BaseItems } from '../interfaces/BaseItems';
import { paginate } from '../utils/paginate';
import type { CategoryFilters } from '../interfaces/CategoryFilters';
import type { CategoryOptions } from '../interfaces/CategoryOptions';

export class CategoryGateway {
	private repository: EntityRepository<Category>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Category);
	}

	public async findAll(filters?: CategoryFilters, options?: CategoryOptions): Promise<BaseItems<Category>> {
		const pagination = paginate(options);

		const parentFilterValues = [];
		if (filters?.parentId) parentFilterValues.push(filters.parentId);
		const parentWhere = `category.parent_id ${parentFilterValues.length ? '= ?' : 'IS NULL'}`;
		const qb = this.repository.createQueryBuilder('category').where(parentWhere, parentFilterValues).leftJoinAndSelect('category.image', 'image');

		if (filters?.productMaxPrice || filters?.productMinPrice || filters?.productSearch) {
			// Number() to prevent SQL injection
			const signal = ['>', '<']; // used for mapping
			const priceQuery = [Number(filters.productMinPrice), Number(filters.productMaxPrice)]
				.filter((v) => !Number.isNaN(v))
				.map((v, idx) => `producer_product.current_price ${signal[idx]}= ${v}`)
				.join(' AND ');

			const productSearchFilterValues = [];
			if (filters.productSearch) productSearchFilterValues.push(`%${filters.productSearch}%`);

			// We need to check if the current level (children, filhos) meets the criteria
			// or if any of the children's children (netos) meet the criteria.
			// We need to show every leaf of the tree, even if the actual leaf does not meet the criteria, for navigation:
			// we need the *parents to show a child that meets it.
			void qb.andWhere(
				// We check if the current category meets the criteria OR has a child that meets the criteria
				`category.id IN (SELECT product_spec_category.category_id
					FROM product_spec_category,
						 producer_product,
						 product_spec
					WHERE product_spec_category.product_spec_id = product_spec.id
					  AND producer_product.product_spec_id = product_spec.id
					  AND (${priceQuery.length ? `(${priceQuery})` : ''}
						${productSearchFilterValues.length ? `${priceQuery.length ? 'OR' : ''} product_spec.name LIKE ?` : ''}
						OR category.id IN (select category_inner.parent_id
										   from (select *
												 from category category_inner2
												 order by parent_id, id) category_inner,
												(select @pv := category.id) initialisation
										   where find_in_set(parent_id, @pv) > 0
													 and @pv :=
															 concat(@pv, ',', id)
															 AND category_inner.id IN
																 (SELECT product_spec_category_inner.category_id
																  FROM product_spec_category product_spec_category_inner,
																	   producer_product producer_product_inner,
																	   product_spec product_spec_inner
																  WHERE product_spec_category_inner.product_spec_id = product_spec.id
																	AND producer_product_inner.product_spec_id = product_spec.id
																	AND (${priceQuery.length ? `(${priceQuery})` : ''}
																		${productSearchFilterValues.length ? `${priceQuery.length ? 'OR' : ''} product_spec.name LIKE ?` : ''})))))`,
				// Needs to be duplicated because we use it in two places (children and grandchildren)
				[...productSearchFilterValues, ...productSearchFilterValues]
			);
		}

		const totalResultsQb = qb.clone();

		// TODO DOESN'T WORK IDK

		void qb.groupBy('category.id');

		// ----- Pagination subquery (because we want to LIMIT before grouping)
		// Process the order by
		let innerOrderBy = `category.name ASC`;
		const leftJoins = [];
		switch (options?.orderBy) {
			case 'popularityAsc':
				// We need to join product_spec_category because it holds the (category, productSpec)
				leftJoins.push(`left join product_spec_category as productSpecCategories
				on category.id = productSpecCategories.category_id`);
				// We need to join producerProduct to get the orderItems
				leftJoins.push(`left join producer_product as producerProduct
				on productSpecCategories.product_spec_id = producerProduct.product_spec_id`);
				// We need to join orderItem to get the quantity
				leftJoins.push(`left join order_item as orderItem
				on producerProduct.id = orderItem.producer_product_id`);

				innerOrderBy = `SUM(orderItem.quantity) ASC`;

				// Outter order by
				void qb.orderBy({ 'SUM(orderItem.quantity)': 'ASC' });
				break;
			case 'popularityDesc':
				// We need to join product_spec_category because it holds the (category, productSpec)
				leftJoins.push(`left join product_spec_category as productSpecCategories
				on category.id = productSpecCategories.category_id`);
				// We need to join producerProduct to get the orderItems
				leftJoins.push(`left join producer_product as producerProduct
				on productSpecCategories.product_spec_id = producerProduct.product_spec_id`);
				// We need to join orderItem to get the quantity
				leftJoins.push(`left join order_item as orderItem
				on producerProduct.id = orderItem.producer_product_id`);

				innerOrderBy = `SUM(orderItem.quantity) DESC`;

				// Outter order by
				void qb.orderBy({ 'SUM(orderItem.quantity)': 'DESC' });
				break;
			case 'ZA':
				innerOrderBy = `category.name DESC`;

				// Outter order by
				void qb.orderBy({ 'category.name': 'DESC' });
				break;
			case 'AZ':
			default:
				innerOrderBy = `category.name ASC`;

				// Outter order by
				void qb.orderBy({ 'category.name': 'ASC' });
				break;
		}

		void qb.andWhere(
			`category.id IN (select category.id
			from (select category.id
				  from category as category
						   ${leftJoins.join(' ')}
				  group by category.id
				  order by ${innerOrderBy}
				  limit ?, ?) as category)`,
			[pagination.offset, pagination.limit]
		);

		// Add orderItem if needed to the outer query
		if (options?.orderBy?.startsWith('popularity')) {
			// Do the joins
			void qb
				.leftJoin('category.productSpecCategories', 'productSpecCategories')
				.leftJoin('productSpecCategories.productSpec', 'productSpec')
				.leftJoin('productSpec.producerProducts', 'producerProduct')
				.leftJoin('producerProduct.orderItems', 'orderItem');
		}

		const [categories, totalResults] = await Promise.all([qb.getResult(), totalResultsQb.count()]);
		return {
			items: categories,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: categories.length
		};
	}

	public async findById(id: number): Promise<Category | null> {
		const category = await this.repository.findOne(id, { populate: ['parent', 'image'] });
		return category;
	}

	public async findByIdWithFields(id: number): Promise<Category | null> {
		const category = await this.repository.findOne(id, { populate: ['fields'] });
		return category;
	}

	public async create(category: Category): Promise<Category> {
		const cat = this.repository.create(category);
		await this.repository.persistAndFlush(cat);
		return cat;
	}

	public async remove(category: Category): Promise<void> {
		// TODO: Soft delete
		await this.repository.removeAndFlush(category);
	}

	public async update(category: Category): Promise<Category> {
		await this.repository.persistAndFlush(category);
		await this.repository.populate(category, ['parent']);
		return category;
	}
}
