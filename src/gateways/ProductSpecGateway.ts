import type { EntityRepository, MikroORM, QueryBuilder } from '@mikro-orm/mysql';
import { isEmpty } from 'lodash';
import { Image, ProductSpec } from '../entities';
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
			.leftJoinAndSelect('spec.images', 'image')
			.leftJoin('spec.producerProducts', 'producerProduct')
			.groupBy(['spec.id', 'image.id'])
			.addSelect('COUNT(producerProduct.producer_id) as producersCount')
			.addSelect('MIN(producerProduct.current_price) as minPrice')
			.addSelect('MAX(producerProduct.current_price) as maxPrice');

		// Paginate
		void qb.offset(pagination.offset).limit(pagination.limit);

		// Fetch results and map them
		const [totalItems, productSpecs] = await Promise.all([
			totalItemsQb.getCount(),
			qb.execute().then((rs) =>
				rs.map((raw: any) => {
					const spec: any = { ...this.repository.map(raw) };
					spec.producersCount = raw.producersCount;
					spec.minPrice = raw.minPrice || -1;
					spec.maxPrice = raw.maxPrice || -1;

					spec.images = spec.images.getItems().map((i: Image) => ({
						id: i.id,
						name: i.name,
						url: i.url,
						alt: i.alt
					})) as any;

					// Remove unnecessary fields
					delete spec.categories;
					delete spec.producerProducts;

					return spec;
				})
			)
		]);

		const totalPages = Math.ceil(totalItems / pagination.limit);
		const page = Math.ceil(pagination.offset / pagination.limit) + 1;
		return { items: productSpecs, totalItems, totalPages, page, pageSize: productSpecs.length };
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
			.execute()
			.then((rs) => {
				if (rs.length === 0) {
					return null;
				}

				const raw = rs[0] as any;

				const spec: any = { ...this.repository.map(raw) };
				spec.producersCount = raw.producersCount;
				spec.minPrice = raw.minPrice || -1;
				spec.maxPrice = raw.maxPrice || -1;

				spec.images = spec.images.getItems().map((i: Image) => ({
					id: i.id,
					name: i.name,
					url: i.url,
					alt: i.alt
				})) as any;

				// Remove unnecessary fields
				delete spec.categories;
				delete spec.producerProducts;

				return spec;
			});
	}
}
