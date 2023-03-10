import { Injectable } from '@decorators/di';
import { Controller, Get, Params, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { container } from '..';
import type { Producer, ProductSpecCategory } from '../entities';
import type { ProducerProduct } from '../entities/ProducerProduct';

@Controller('/products')
@Injectable()
export class ProductsController {
	@Get('/')
	public async allProducts(@Response() res: Express.Response, @Request() req: Express.Request) {
		try {
			let items: ProducerProduct[] = new Array<ProducerProduct>();
			let totalPages = 0;
			let result = { products: new Array<ProducerProduct>(), totalResults: 0 };
			let page = 1;
			if (req.query.page) {
				page = Number(req.query.page as string);
				if (req.query.categoryId) {
					console.log('category');
					const categoryId = Number(req.query.categoryId as string);
					result = await container.productGateway.findByCategoryId(categoryId, page);
				} else {
					result = await container.productGateway.findAll(page);
				}
			} else if (req.query.categoryId) {
				const categoryId = Number(req.query.categoryId as string);
				result = await container.productGateway.findByCategoryId(categoryId, 1);
			} else {
				result = await container.productGateway.findAll(1);
			}
			items = result.products;
			totalPages = Math.ceil(result.totalResults / 24);
			res.status(200).json({ items, page, pageSize: items.length, totalResults: result.totalResults, totalPages });
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
			let items: ProducerProduct[] = new Array<ProducerProduct>();
			let totalPages = 0;
			let result = { products: new Array<ProducerProduct>(), totalResults: 0 };
			let page = 1;

			if (req.query.page) {
				page = Number(req.query.page as string);
				result = await container.productGateway.findBySpecificationId(productSpecId, page);
			} else {
				result = await container.productGateway.findBySpecificationId(productSpecId, 1);
			}

			items = result.products;
			if (items.length > 0) {
				totalPages = Math.ceil(result.totalResults / 24);
				res.status(200).json({ items, page, pageSize: items.length, totalResults: result.totalResults, totalPages });
			} else {
				res.status(404).json({ error: 'Product Spec not found' });
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
			let items: Producer[] = new Array<Producer>();
			let products: ProducerProduct[] = new Array<ProducerProduct>();
			let totalPages = 0;
			let result = { products: new Array<ProducerProduct>(), totalResults: 0 };
			let page = 1;

			if (req.query.page) {
				page = Number(req.query.page as string);
				result = await container.productGateway.findBySpecificationId(productSpecId, page);
			} else {
				result = await container.productGateway.findBySpecificationId(productSpecId, 1);
			}
			products = result.products;
			if (products.length > 0) {
				items = products.map((p) => p.producer);
				totalPages = Math.ceil(result.totalResults / 24);
				res.status(200).json({ items, page, pageSize: items.length, totalResults: result.totalResults, totalPages });
			} else {
				res.status(404).json({ error: 'Product Spec not found' });
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
			let items: ProductSpecCategory[] = new Array<ProductSpecCategory>();
			let totalPages = 0;
			let result = { categories: new Array<ProductSpecCategory>(), totalResults: 0 };
			let page = 1;

			if (req.query.page) {
				page = Number(req.query.page as string);
				result = await container.productSpecCategoryGateway.findCategoriesBySpecificationId(productSpecId, page);
			} else {
				result = await container.productSpecCategoryGateway.findCategoriesBySpecificationId(productSpecId, 1);
			}
			items = result.categories;
			if (items.length > 0) {
				totalPages = Math.ceil(result.totalResults / 24);
				res.status(200).json({ items, page, pageSize: items.length, totalResults: result.totalResults, totalPages });
			} else {
				res.status(404).json({ error: 'Product Spec not found' });
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
				const item = c[0].category;
				res.status(200).json(item);
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
		@Params('categoryId') categoryId: number
	) {
		try {
			const c = await container.productSpecFieldGateway.findFieldsBySpecAndCategory(Number(productSpecId), Number(categoryId));
			if (c.length > 0) {
				res.status(200).json({ items: c });
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
			const c = await container.productSpecFieldGateway.findFieldsBySpecAndCategoryWithField(
				Number(productSpecId),
				Number(categoryId),
				Number(fieldId)
			);
			if (c.length > 0) {
				res.status(200).json(c[0]);
			} else {
				res.status(404).json({ error: 'Category or Specification not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}
}
