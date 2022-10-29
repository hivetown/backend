import type { QBFilterQuery } from '@mikro-orm/core';
import type { Request, Response } from 'express';
import { container } from '..';
import type { Product } from '../entities';

export async function fetchProducts(req: Request, res: Response) {
	const where: QBFilterQuery<Product> = {};
	if (req.query.search) where.specification = { name: { $like: `%${req.query.search as string}%` } };

	const products = await container.productRepository
		.createQueryBuilder('p')
		.leftJoinAndSelect('p.specification', 'spec')
		.where(where)
		.getResultList();

	res.json(products);
}
