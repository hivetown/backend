import { Injectable } from '@decorators/di';
import { Controller, Get, Params, Response } from '@decorators/express';
import * as Express from 'express';
import { container } from '..';

@Controller('/consumers')
@Injectable()
export class ConsumerController {
	@Get('/{consumerId}/cart')
	public async producerCart(@Response() res: Express.Response, @Params('consumerId') consumerId: number) {
		try {
			const cart = await container.cartGateway.findByConsumerId(consumerId);
			res.json({ cart });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}
}
