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
		};

		if (filter && !isEmpty(filter)) {
			// console.log(filter);
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
			console.log(filter.fields);
			if (filter.fields) {
				const mappedFields = Object.values(filter.fields).map((fieldValues, fieldId) => ({
					field: {
						id: fieldId,
						$or: fieldValues.map((value) => ({ value }))
					}
				}));

				console.log(mappedFields);

				categories.fields = {
					$and: mappedFields
				};
			}
			if (!isEmpty(categories)) {
				actualFilter.categories = categories;
			}
		}
		console.log('actualFilter e options');
		console.log(actualFilter);
		console.log(actualOptions);
		const productSpecs = await this.repository.find(actualFilter, actualOptions);
		const totalItems = await this.repository.count(actualFilter);
		const pageSize = productSpecs.length;
		let page;
		if (actualOptions.offset !== undefined && actualOptions.limit !== undefined) {
			page = actualOptions.offset / actualOptions.limit + 1;
		} else {
			page = 1;
		}

		return { items: productSpecs, totalItems, page, pageSize };
	}

	public async findById(id: number): Promise<ProductSpec | null> {
		const productSpec = await this.repository.findOne(id);
		return productSpec;
	}
}
