import { Injectable } from '@decorators/di';
import { Controller, Get, Params, Response } from '@decorators/express';
import * as Express from 'express';
import { container } from '..';
import type { Category } from '../entities';

@Controller('/products')
@Injectable()
export class ProductsController {
	@Get('/')
	public async allProducts(@Response() res: Express.Response) {
		try {
			const products = await container.productGateway.findAll();

			for (const product of products) {
				console.log(product.getProducer().toString());
			}

			res.json({ products });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:id')
	public async productById(@Response() res: Express.Response, @Params('id') id: number) {
		try {
			const product = await container.productGateway.findById(id);
			res.json({ product });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/specification/:id')
	public async productBySpecificationId(@Response() res: Express.Response, @Params('id') id: number) {
		try {
			const products = await container.productGateway.findBySpecificationId(id);
			res.json({ products });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/specification/:id/categories')
	public async productCategoriesBySpecificationId(@Response() res: Express.Response, @Params('id') id: number) {
		try {
			const categories = await container.productSpecCategoryGateway.findCategoriesBySpecificationId(id);
			res.json({ categories });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/specification/:id/categories/:categoryId')
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
