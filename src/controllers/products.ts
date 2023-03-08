import { Injectable } from '@decorators/di';
import { Controller, Get, Params, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { container } from '..';
import type { ProducerProduct } from '../entities/ProducerProduct';

@Controller('/products')
@Injectable()
export class ProductsController {
	@Get('/')
	public async allProducts(@Response() res: Express.Response, @Request() req: Express.Request) {
		try {
			let items: ProducerProduct[] = new Array<ProducerProduct>();
			if (req.query.categoryId) {
				const categoryId = req.query.categoryId as string;
				items = await container.productGateway.findByCategoryId(Number(categoryId));
			} else {
				items = await container.productGateway.findAll();
			}

			res.status(200).json({ items });
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
	public async productsBySpecificationId(@Response() res: Express.Response, @Params('productSpecId') productSpecId: number) {
		try {
			const items = await container.productGateway.findBySpecificationId(productSpecId);
			if (items.length > 0) {
				res.status(200).json({ items });
			} else {
				res.status(404).json({ error: 'Product Spec not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:productSpecId/producers')
	public async producerByProductSpec(@Response() res: Express.Response, @Params('productSpecId') productSpecId: number) {
		try {
			const products = await container.productGateway.findBySpecificationId(productSpecId);
			if (products.length > 0) {
				const items = products.map((p) => p.producer);
				res.status(200).json({ items });
			} else {
				res.status(404).json({ error: 'Product Spec not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:productSpecId/categories')
	public async productCategoriesBySpecificationId(@Response() res: Express.Response, @Params('productSpecId') productSpecId: number) {
		try {
			const items = await container.productSpecCategoryGateway.findCategoriesBySpecificationId(productSpecId);
			if (items.length > 0) {
				res.status(200).json({ items });
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
			console.log(c);
			if (c.length > 0) {
				const { category } = c[0];
				res.status(200).json({ category });
			} else {
				res.status(404).json({ error: 'Category not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}
}
