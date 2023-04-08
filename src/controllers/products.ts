import { Injectable } from '@decorators/di';
import { Controller, Get, Params, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { isEmpty } from 'lodash';
import { container } from '..';
import { StringSearchType } from '../enums/StringSearchType';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import type { ProductSpecFilters } from '../interfaces/ProductSpecFilters';
import type { ProductSpecOptions } from '../interfaces/ProductSpecOptions';
import type { FieldTypeType } from '../types/FieldType';
import { Joi, validate } from 'express-validation';

@Controller('/products')
@Injectable()
export class ProductsController {
	@Get('/', [
		validate({
			query: Joi.object({
				categoryId: Joi.number().integer().min(1),
				search: Joi.string().min(3),
				page: Joi.number().integer().min(1),
				pageSize: Joi.number().integer().min(1),
				field: Joi.object().pattern(/^'\d+'$/, Joi.array())
			})
		})
	])
	public async allProducts(@Response() res: Express.Response, @Request() req: Express.Request) {
		try {
			const queryFields = Object.entries((req.query.field as Record<string, string[]>) || {});
			const fields: { [key: number]: FieldTypeType[] } = {};
			// Remove field key string and get only the number part
			for (const [rawKey, rawValues] of queryFields) {
				// get only the number part of the key
				const key = Number(rawKey.match(/\d+/)?.[0]);
				if (!key) continue;

				// add the value to the new object
				if (fields[key]) fields[key].push(...rawValues);
				else fields[key] = [...rawValues];
			}

			const filters: ProductSpecFilters = {
				categoryId: Number(req.query.categoryId) || undefined,
				fields: isEmpty(fields) ? undefined : fields
			};

			if ('search' in req.query) {
				filters.search = { value: req.query.search as string, type: StringSearchType.CONTAINS };
			}

			const options: ProductSpecOptions = {
				page: Number(req.query.page) || -1,
				size: Number(req.query.pageSize) || -1
				// sort: 'sort' in req.query ? (req.query.sort as string) : undefined
			};

			// const optionsFiltrados = Object.fromEntries(Object.entries(options).filter(([_, v]) => v !== undefined));
			const productsSpec = await container.productSpecGateway.findAll(filters, options);
			// console.log(productsSpec);

			res.status(200).json(productsSpec);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:productSpecId', [
		validate({
			params: Joi.object({
				productSpecId: Joi.number().integer().min(1).required()
			})
		})
	])
	public async productSpecById(@Response() res: Express.Response, @Params('productSpecId') productSpecId: number) {
		try {
			const productSpec = await container.productSpecGatway.findById(productSpecId);
			if (productSpec) {
				res.status(200).json(productSpec);
			} else {
				res.status(404).json({ error: 'Product Spec not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:productSpecId/products', [
		validate({
			params: Joi.object({
				productSpecId: Joi.number().integer().min(1).required()
			}),
			query: Joi.object({
				page: Joi.number().integer().min(1),
				pageSize: Joi.number().integer().min(1)
			})
		})
	])
	public async productsBySpecificationId(
		@Response() res: Express.Response,
		@Params('productSpecId') productSpecId: number,
		@Request() req: Express.Request
	) {
		try {
			const productSpec = await container.productSpecGatway.findById(productSpecId);

			if (productSpec) {
				const options: ProductSpecOptions = {
					page: Number(req.query.page) || -1,
					size: Number(req.query.pageSize) || -1
				};

				const results = await container.producerProductGateway.findBySpecificationId(productSpecId, options);

				res.status(200).json(results);
			} else {
				res.status(404).json({ error: 'Product Spec not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:productSpecId/producers', [
		validate({
			params: Joi.object({
				productSpecId: Joi.number().integer().min(1).required()
			}),
			query: Joi.object({
				page: Joi.number().integer().min(1),
				pageSize: Joi.number().integer().min(1)
			})
		})
	])
	public async producerByProductSpec(
		@Response() res: Express.Response,
		@Params('productSpecId') productSpecId: number,
		@Request() req: Express.Request
	) {
		try {
			const productSpec = await container.productSpecGatway.findById(productSpecId);

			if (productSpec) {
				const options: PaginatedOptions = {
					page: Number(req.query.page) || -1,
					size: Number(req.query.pageSize) || -1
				};

				const results = await container.producerGateway.findFromProductSpecId(productSpecId, options);

				res.status(200).json(results);
			} else {
				res.status(404).json({ error: 'Product Spec not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:productSpecId/categories', [
		validate({
			params: Joi.object({
				productSpecId: Joi.number().integer().min(1).required()
			}),
			query: Joi.object({
				page: Joi.number().integer().min(1),
				pageSize: Joi.number().integer().min(1)
			})
		})
	])
	public async productCategoriesBySpecificationId(
		@Response() res: Express.Response,
		@Params('productSpecId') productSpecId: number,
		@Request() req: Express.Request
	) {
		try {
			const productSpec = await container.productSpecGatway.findById(productSpecId);

			if (productSpec) {
				const options: PaginatedOptions = {
					page: Number(req.query.page) || -1,
					size: Number(req.query.pageSize) || -1
				};

				const results = await container.productSpecCategoryGateway.findCategoriesBySpecificationId(productSpecId, options);

				res.status(200).json(results);
			} else {
				res.status(404).json({ error: 'Product Spec not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:productSpecId/categories/:categoryId', [
		validate({
			params: Joi.object({
				productSpecId: Joi.number().integer().min(1).required(),
				categoryId: Joi.number().integer().min(1).required()
			})
		})
	])
	public async productCategoryBySpecificationId(
		@Response() res: Express.Response,
		@Params('productSpecId') productSpecId: number,
		@Params('categoryId') categoryId: number
	) {
		try {
			const productSpec = await container.productSpecGatway.findById(productSpecId);
			if (productSpec) {
				const category = await container.categoryGateway.findById(categoryId);
				if (category) {
					const c = await container.productSpecCategoryGateway.findCategoryBySpecificationId(productSpecId, categoryId);
					if (c) {
						res.status(200).json(c.category);
					} else {
						res.status(404).json({ error: 'Category not found in this Product Specification' });
					}
				} else {
					res.status(404).json({ error: 'Category not found' });
				}
			} else {
				res.status(404).json({ error: 'Product Spec not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:productSpecId/categories/:categoryId/fields', [
		validate({
			params: Joi.object({
				productSpecId: Joi.number().integer().min(1).required(),
				categoryId: Joi.number().integer().min(1).required()
			}),
			query: Joi.object({
				page: Joi.number().integer().min(1),
				pageSize: Joi.number().integer().min(1)
			})
		})
	])
	public async productFieldsByCateogryOfSpecification(
		@Response() res: Express.Response,
		@Params('productSpecId') productSpecId: number,
		@Params('categoryId') categoryId: number,
		@Request() req: Express.Request
	) {
		try {
			const productSpec = await container.productSpecGatway.findById(productSpecId);
			if (productSpec) {
				const category = await container.categoryGateway.findById(categoryId);
				if (category) {
					const options: PaginatedOptions = {
						page: Number(req.query.page) || -1,
						size: Number(req.query.pageSize) || -1
					};
					const f = await container.productSpecFieldGateway.findAllFieldsByProductSpecIdAndCategoryId(productSpecId, categoryId, options);

					res.status(200).json(f);
				} else {
					res.status(404).json({ error: 'Category not found' });
				}
			} else {
				res.status(404).json({ error: 'Product Spec not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:productSpecId/categories/:categoryId/fields/:fieldId', [
		validate({
			params: Joi.object({
				productSpecId: Joi.number().integer().min(1).required(),
				categoryId: Joi.number().integer().min(1).required(),
				fieldId: Joi.number().integer().min(1).required()
			})
		})
	])
	public async productFieldByCateogryOfSpecificationAndField(
		@Response() res: Express.Response,
		@Params('productSpecId') productSpecId: number,
		@Params('categoryId') categoryId: number,
		@Params('fieldId') fieldId: number
	) {
		try {
			const productSpec = await container.productSpecGatway.findById(productSpecId);
			if (productSpec) {
				const category = await container.categoryGateway.findById(categoryId);
				if (category) {
					const field = await container.fieldGateway.findById(fieldId);
					if (field) {
						const c = await container.productSpecFieldGateway.findFieldBySpecAndCategory(productSpecId, categoryId, fieldId);
						if (c) {
							res.status(200).json(c);
						} else {
							res.status(404).json({ error: 'Field of this Category of this Product Specification not found' });
						}
					} else {
						res.status(404).json({ error: 'Field not found' });
					}
				} else {
					res.status(404).json({ error: 'Category not found' });
				}
			} else {
				res.status(404).json({ error: 'Product Spec not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}
}
