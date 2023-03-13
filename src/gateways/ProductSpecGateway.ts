import type { FilterQuery, FindOptions, ObjectQuery } from '@mikro-orm/core';
import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { isEmpty } from 'lodash';
import { ProductSpec, ProductSpecCategory } from '../entities';
import type { PaginatedOptions as PaginationOptions } from '../interfaces/PaginationOptions';
import type { ProductSpecFilters } from '../interfaces/ProductSpecFilters';
import type { ProductSpecOptions } from '../interfaces/ProductSpecOptions';
import { paginate } from '../utils/paginate';
import { stringSearchType } from '../utils/stringSearchType';

export class ProductSpecGateway {
	private repository: EntityRepository<ProductSpec>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(ProductSpec);
	}

	public async findAll(filter?: ProductSpecFilters, options?: ProductSpecOptions): Promise<ProductSpec[]> {
		const actualFilter: FilterQuery<ProductSpec> = { categories: {} };
		if (filter && !isEmpty(filter)) {
			if (filter.name) actualFilter.name = stringSearchType(filter.name);
			if (filter.description) actualFilter.description = stringSearchType(filter.description);

			const categories: ObjectQuery<ProductSpecCategory> = {};
			if (filter.categoryId) categories.category = { id: filter.categoryId };
			if (filter.fields) {
				const mappedFields = Object.values(filter.fields).map((fieldValues, fieldId) => ({
					field: {
						id: fieldId,
						$or: fieldValues.map((value) => ({ value }))
					}
				}));

				categories.fields = {
					$and: mappedFields
				};
			}

			actualFilter.categories = categories;
		}

		const actualOptions: FindOptions<ProductSpec> = {
			// Add pagination
			...paginate(options)
		};

		const productSpecs = await this.repository.find(actualFilter, actualOptions);
		// const productSpecs = await this.repo~sitory.find({
		// 	categories: {
		// 		category: { id: 1 },
		// 		fields: {
		// 			$and: [
		// 				{
		// 					field: {
		// 						id: 14
		// 					},
		// 					$or: [
		// 						{
		// 							value: 'female'
		// 						},
		// 						{
		// 							value: 'male'
		// 						}
		// 					]
		// 				},
		// 				{
		// 					field: {
		// 						id: 15
		// 					},
		// 					value: 'female'
		// 				}
		// 			]
		// 		}
		// 	}
		// });
		// const productSpecs = await this.repository.findAll({ populate: ['categories'] });
		return productSpecs;
	}

	public async findById(id: number): Promise<ProductSpec | null> {
		const productSpec = await this.repository.findOne(id);
		return productSpec;
	}
}
