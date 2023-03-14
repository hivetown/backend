import type { FilterQuery, FindOptions, ObjectQuery } from '@mikro-orm/core';
import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { isEmpty } from 'lodash';
import { ProductSpec, ProductSpecCategory } from '../entities';
import type { ProductSpecFilters } from '../interfaces/ProductSpecFilters';
import type { ProductSpecOptions } from '../interfaces/ProductSpecOptions';
import { paginate } from '../utils/paginate';
import { stringSearchType } from '../utils/stringSearchType';

export class ProductSpecGateway {
	private repository: EntityRepository<ProductSpec>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(ProductSpec);
	}

	public async findAll(
		filter?: ProductSpecFilters,
		options?: ProductSpecOptions
	): Promise<{ items: ProductSpec[]; totalItems: number; page: number; pageSize: number }> {
		const actualFilter: FilterQuery<ProductSpec> = {};
		const actualOptions: FindOptions<ProductSpec> = {
			...paginate(options)
			// populate: ['categories', 'categories.fields'] as any
		};

		if (filter && !isEmpty(filter)) {
			if (filter.name) {
				actualFilter.name = stringSearchType(filter.name);
			}

			if (filter.description) {
				actualFilter.description = stringSearchType(filter.description);
			}

			const categories: ObjectQuery<ProductSpecCategory> = {};
			if (filter.categoryId) {
				actualFilter.categories = { category: { id: filter.categoryId } };
			}

			if (!isEmpty(filter.fields)) {
				// PS: Object entries internally transforms the key into a string
				// this isn't exactly a problem, because the ORM eats it
				const mappedProductSpecField = Object.entries(filter.fields).map(([fieldId, fieldValues]) => ({
					field: {
						id: fieldId
					},
					$or: fieldValues.map((value) => ({ value }))
				}));

				categories.fields = {
					$and: mappedProductSpecField
				};
			}

			if (!isEmpty(categories)) {
				actualFilter.categories = categories;
			}
		}

		const productSpecs = await this.repository.find(actualFilter, actualOptions);
		const totalItems = await this.repository.count(actualFilter);
		// We add +1 so it starts at 1 instead of 0
		const page = Math.ceil((actualOptions.offset || 0) / (actualOptions.limit || 1)) + 1;

		return { items: productSpecs, totalItems, page, pageSize: actualOptions.limit || 0 };
	}

	public async findById(id: number): Promise<ProductSpec | null> {
		const productSpec = await this.repository.findOne(id);
		return productSpec;
	}
}
