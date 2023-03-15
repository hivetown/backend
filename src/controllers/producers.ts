import { Injectable } from '@decorators/di';
import { Controller, Get, Params, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { container } from '..';
import type { ProducerProductOptions } from '../interfaces/ProducerProductOptions';

@Controller('/producers')
@Injectable()
export class ProducersController {
	@Get('/:producerId/products')
	public async producerProducts(@Response() res: Express.Response, @Request() req: Express.Request, @Params('producerId') producerId: number) {
		try {
			const options: ProducerProductOptions = {
				page: Number(req.query.page) || -1,
				size: Number(req.query.pageSize) || -1,
				populate: ['productSpec', 'productionUnit']
			};

			const producerProducts = await container.productGateway.findAll({ producerId }, options);
			res.json(producerProducts);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}
}
