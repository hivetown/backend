import { Injectable } from '@decorators/di';
import { Controller, Get, Params, Response } from '@decorators/express';
import * as Express from 'express';
import { container } from '..';
// import { Consumer } from '../entities';

@Controller('/consumers')
@Injectable()
export class ConsumerController {
	@Get('/')
	public async getConsumers(@Response() res: Express.Response): Promise<void> {
		const consumers = await container.consumerGateway.findAll();
		res.json(consumers);
	}

	@Get('/:consumerId/cart')
	public async getCart(@Response() res: Express.Response, @Params('consumerId') consumerId: number): Promise<void> {
		try {
			const consumer = await container.consumerGateway.findByIdWithCart(consumerId);

			if (consumer) {
				const items = consumer.cartItems.getItems();
				res.status(200).json({ items });
			} else {
				res.status(404).json({ error: 'Consumer not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	// @Post('/:consumerId/cart')

	// @Delete('/:consumerId/cart')

	// @Put('/:consumerId/cart/:producerProductId')
}
