import { Injectable } from '@decorators/di';
import { Controller, Get, Params, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { container } from '..';
import type { Category } from '../entities/Category';
import type { ProducerProduct } from '../entities/ProducerProduct';

@Controller('/products')
@Injectable()
export class ProductsController {
	@Get('/')
	public async allProducts(@Response() res: Express.Response, @Request() req: Express.Request) {
		try {
			let products: ProducerProduct[] = new Array<ProducerProduct>();
			if (!req) {
				products = await container.productGateway.findAll();
			} else if (req) {
				const { categoryId } = req.query;
				products = await container.productGateway.findByCategoryId(Number(categoryId));
			}

			res.json({ products });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:productSpecId')
	public async productSpecById(@Response() res: Express.Response, @Params('productSpecId') productSpecId: number) {
		try {
			const productSpec = await container.productSpecGatway.findById(productSpecId);
			res.json({ productSpec });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:productSpecId/products')
	public async productsBySpecificationId(@Response() res: Express.Response, @Params('id') id: number) {
		try {
			const products = await container.productGateway.findBySpecificationId(id);
			res.json({ products });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:productSpecId/producer')
	public async producerByProductSpec(@Response() res: Express.Response, @Params('id') id: number) {
		try {
			const products = await container.productGateway.findBySpecificationId(id);
			res.json({ products });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:productSpecId/categories')
	public async productCategoriesBySpecificationId(@Response() res: Express.Response, @Params('id') id: number) {
		try {
			const categories = await container.productSpecCategoryGateway.findCategoriesBySpecificationId(id);
			res.json({ categories });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:productSpecId/categories/:categoryId')
	public async productCategoryBySpecificationId(
		@Response() res: Express.Response,
		@Params('id') id: number,
		@Params('categoryId') categoryId: number
	) {
		try {
			const category = await container.productSpecCategoryGateway.findCategoryBySpecificationId(id, categoryId);
			const c: Category = category[0].getCategory();
			res.json({ c });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}
}
