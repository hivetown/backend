import type { Request, Response } from 'express';
import { container } from '..';
import { Product } from '../entities';

export async function fetchProducts(_req: Request, res: Response) {
	const products = await container.em.find(Product, {});
	res.json(products);
}
