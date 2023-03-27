import { Injectable } from '@decorators/di';
import { Controller, Get, Params, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { isEmpty } from 'lodash';
import { container } from '..';
// import type { Producer, ProductSpecCategory } from '../entities';
// import type { ProducerProduct } from '../entities/ProducerProduct';
import { StringSearchType } from '../enums/StringSearchType';
import type { ProductSpecFilters } from '../interfaces/ProductSpecFilters';
import type { ProductSpecOptions } from '../interfaces/ProductSpecOptions';
import type { FieldTypeType } from '../types/FieldType';

@Controller('/products')
@Injectable()
export class ProductsController {
	@Get('/')
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
			if (productsSpec.totalItems > 0) {
				res.status(200).json(productsSpec);
			} else {
				res.status(404).json({ error: 'No Products Specifications were found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:productSpecId')
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

	@Get('/:productSpecId/products')
	public async productsBySpecificationId(
		@Response() res: Express.Response,
		@Params('productSpecId') productSpecId: number,
		@Request() req: Express.Request
	) {
		try {
			const options: ProductSpecOptions = {
				page: Number(req.query.page) || -1,
				size: Number(req.query.pageSize) || -1
			};

			const results = await container.productGateway.findBySpecificationId(productSpecId, options);

			if (results.totalItems > 0) {
				res.status(200).json(results);
			} else {
				res.status(404).json({ error: 'No products were found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:productSpecId/producers')
	public async producerByProductSpec(
		@Response() res: Express.Response,
		@Params('productSpecId') productSpecId: number,
		@Request() req: Express.Request
	) {
		try {
			const options: ProductSpecOptions = {
				page: Number(req.query.page) || -1,
				size: Number(req.query.pageSize) || -1
			};

			const results = await container.producerGateway.findFromProductSpecId(productSpecId, options);

			if (results.totalItems > 0) {
				res.status(200).json(results);
			} else {
				res.status(404).json({ error: 'No producers were found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:productSpecId/categories')
	public async productCategoriesBySpecificationId(
		@Response() res: Express.Response,
		@Params('productSpecId') productSpecId: number,
		@Request() req: Express.Request
	) {
		try {
			const options: ProductSpecOptions = {
				page: Number(req.query.page) || -1,
				size: Number(req.query.pageSize) || -1
			};

			const results = await container.productSpecCategoryGateway.findCategoriesBySpecificationId(productSpecId, options);

			if (results.totalItems > 0) {
				res.status(200).json(results);
			} else {
				res.status(404).json({ error: 'No categories were found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:productSpecId/categories/:categoryId')
	public async productCategoryBySpecificationId(
		@Response() res: Express.Response,
		@Params('productSpecId') productSpecId: number,
		@Params('categoryId') categoryId: number
	) {
		try {
			const c = await container.productSpecCategoryGateway.findCategoryBySpecificationId(productSpecId, categoryId);
			if (c.length > 0) {
				const item = c[0];
				res.status(200).json({ category: item });
			} else {
				res.status(404).json({ error: 'Category not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:productSpecId/categories/:categoryId/fields')
	public async productFieldsByCateogryOfSpecification(
		@Response() res: Express.Response,
		@Params('productSpecId') productSpecId: number,
		@Params('categoryId') categoryId: number,
		@Request() req: Express.Request
	) {
		try {
			const options: ProductSpecOptions = {
				page: Number(req.query.page) || -1,
				size: Number(req.query.pageSize) || -1
			};
			const f = await container.productSpecFieldGateway.findAllFieldsByProductSpecIdAndCategoryId(productSpecId, categoryId, options);
			if (f.totalItems > 0) {
				res.status(200).json(f);
			} else {
				res.status(404).json({ error: 'Category or Specification not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:productSpecId/categories/:categoryId/fields/:fieldId')
	public async productFieldByCateogryOfSpecificationAndField(
		@Response() res: Express.Response,
		@Params('productSpecId') productSpecId: number,
		@Params('categoryId') categoryId: number,
		@Params('fieldId') fieldId: number
	) {
		try {
			const c = await container.productSpecFieldGateway.findFieldBySpecAndCategory(productSpecId, categoryId, fieldId);
			if (c) {
				res.status(200).json(c);
			} else {
				res.status(404).json({ error: 'Category or Specification not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}
}
