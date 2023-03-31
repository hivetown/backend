import type { EntityRepository, MikroORM, QueryBuilder } from '@mikro-orm/mysql';
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

	public async findAll(filter?: ProductSpecFilters, options?: ProductSpecOptions): Promise<BaseItems<ProductSpec>> {
		const pagination = paginate(options);
		const qb: QueryBuilder<ProductSpec> = this.repository.createQueryBuilder('spec').select('*');

		if (filter?.categoryId) {
			void qb.leftJoin('spec.categories', 'specCategory').andWhere({ 'specCategory.category_id': filter.categoryId });
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
		const totalItemsQb = qb.clone();

		// Add producers count, min and max price
		void qb
			.leftJoin('spec.producerProducts', 'producerProduct')
			.groupBy('spec.id')
			.addSelect('COUNT(producerProduct.producer_id) as producersCount')
			.addSelect('MIN(producerProduct.current_price) as minPrice')
			.addSelect('MAX(producerProduct.current_price) as maxPrice');

		// Paginate
		void qb.offset(pagination.offset).limit(pagination.limit);

		// Fetch results and map them
		const [totalItems, productSpecs] = await Promise.all([totalItemsQb.getCount(), qb.execute().then(rs => rs.map((raw: any) => {
			const spec: any = { ...this.repository.map(raw) };
			spec.producersCount = raw.producersCount;
			spec.minPrice = raw.minPrice || -1;
			spec.maxPrice = raw.maxPrice || -1;

			// Remove unnecessary fields
			delete spec.categories;
			delete spec.producerProducts;

			return spec;
		}))]);

		const totalPages = Math.ceil(totalItems / pagination.limit);
		const page = Math.ceil(pagination.offset / pagination.limit) + 1;
		return { items: productSpecs, totalItems, totalPages, page, pageSize: productSpecs.length };
	}

	public async findById(id: number): Promise<ProductSpec | null> {
		const productSpec = await this.repository.findOne(id, { fields: ['id', 'name', 'description', 'images', 'producerProducts.producer'] });
		return productSpec;
	}
}
