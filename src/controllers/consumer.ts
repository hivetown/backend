import { Injectable } from '@decorators/di';
import { Controller, Delete, Get, Params, Post, Put, Request, Response } from '@decorators/express';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import * as Express from 'express';
import { Joi, validate } from 'express-validation';
import { container } from '..';
import { CartItem, Consumer } from '../entities';
import { ApiError } from '../errors/ApiError';
import { ConflictError } from '../errors/ConflictError';
import { AuthMiddleware } from '../middlewares/auth';
// import { Consumer } from '../entities';

@Controller('/consumers')
@Injectable()
export class ConsumerController {
	@Get('/', [AuthMiddleware])
	public async getConsumers(@Response() res: Express.Response): Promise<void> {
		const consumers = await container.consumerGateway.findAll();
		res.json(consumers);
	}

	@Post('/', [
		validate({
			body: Joi.object({
				name: Joi.string().required(),
				phone: Joi.string().required(),
				vat: Joi.number().required()
			})
		}),
		AuthMiddleware
	])
	public async createConsumer(@Response() res: Express.Response, @Request() req: Express.Request): Promise<void> {
		try {
			const data: Consumer = req.body;
			data.authId = req.authUser!.uid;
			data.email = req.authUser!.email!;

			const consumer = await container.consumerGateway.create(data);
			res.status(201).json(consumer);
		} catch (error) {
			if (error instanceof UniqueConstraintViolationException) {
				throw new ConflictError('Consumer already exists');
			}

			throw new ApiError((error as any).message, 500);
		}
	}

	@Get('/:consumerId/cart', [AuthMiddleware])
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

	@Post('/:consumerId/cart', [AuthMiddleware])
	public async addCartItem(
		@Response() res: Express.Response,
		@Request() req: Express.Request,
		@Params('consumerId') consumerId: number
	): Promise<void> {
		try {
			const consumer = await container.consumerGateway.findByIdWithCart(consumerId);

			if (consumer) {
				const items = consumer.cartItems.getItems();
				const item = items.find((item) => item.producerProduct.id === Number(req.body.product.id));
				if (item) {
					item.quantity = req.body.quantity;
				} else {
					const newItem = new CartItem(consumer, req.body.product, req.body.quantity);
					consumer.cartItems.add(newItem);
				}

				await container.consumerGateway.updateCart(consumer);
				res.status(201).json({ message: 'Item added to cart' });
			} else {
				res.status(404).json({ error: 'Consumer not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Delete('/:consumerId/cart', [AuthMiddleware])
	public async deleteCart(@Response() res: Express.Response, @Params('consumerId') consumerId: number): Promise<void> {
		try {
			const consumer = await container.consumerGateway.findByIdWithCart(consumerId);

			if (consumer) {
				await container.consumerGateway.deleteCart(consumer);
				res.status(200).json({ message: 'Cart cleared' });
			} else {
				res.status(404).json({ error: 'Consumer not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Put('/:consumerId/cart/:producerProductId', [AuthMiddleware])
	public async updateQuantityCartItem(
		@Response() res: Express.Response,
		@Request() req: Express.Request,
		@Params('consumerId') consumerId: number,
		@Params('producerProductId') producerProductId: number
	): Promise<void> {
		try {
			const consumer = await container.consumerGateway.findByIdWithCart(consumerId);

			if (consumer) {
				const items = consumer.cartItems.getItems();
				const item = items.find((item) => item.producerProduct.id === Number(producerProductId));

				if (item) {
					item.quantity = req.body.quantity;
					await container.consumerGateway.updateCart(consumer);
					res.status(200).json({ items: consumer.cartItems.getItems() });
				} else {
					res.status(404).json({ error: 'Item not found' });
				}
			} else {
				res.status(404).json({ error: 'Consumer not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}
}
