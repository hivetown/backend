import { Injectable } from '@decorators/di';
import { Controller, Delete, Get, Params, Post, Put, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { Joi, validate } from 'express-validation';
import { container } from '..';
import { CartItem } from '../entities';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';

@Controller('/consumers')
@Injectable()
export class ConsumerController {
	@Get('/')
	public async getConsumers(@Response() res: Express.Response): Promise<void> {
		const consumers = await container.consumerGateway.findAll();
		res.json(consumers);
	}

	@Get('/:consumerId/cart', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			}),
			query: Joi.object({
				page: Joi.number().integer().min(1),
				pageSize: Joi.number().integer().min(1)
			})
		})
	])
	public async getCart(
		@Response() res: Express.Response,
		@Params('consumerId') consumerId: number,
		@Request() req: Express.Request
	): Promise<void> {
		try {
			const options: PaginatedOptions = {
				page: Number(req.query.page) || -1,
				size: Number(req.query.pageSize) || -1
			};

			const items = await container.cartItemGateway.findAllItemsByConsumerId(consumerId, options);

			res.status(200).json(items);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Post('/:consumerId/cart', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			}),
			body: Joi.object({
				producerProduct: Joi.number().integer().min(1).required(),
				quantity: Joi.number().integer().min(1).required()
			})
		})
	])
	public async addCartItem(
		@Response() res: Express.Response,
		@Request() req: Express.Request,
		@Params('consumerId') consumerId: number
	): Promise<void> {
		try {
			const consumer = await container.consumerGateway.findByIdWithCart(consumerId);
			const product = await container.productGateway.findById(Number(req.body.producerProduct));
			if (consumer) {
				if (product) {
					const items = consumer.cartItems.getItems();
					const item = items.find((item) => item.producerProduct.id === Number(req.body.producerProduct));
					if (req.body.quantity <= product.stock) {
						let updatedItem = null;
						if (item) {
							item.quantity = req.body.quantity;
							updatedItem = await container.cartItemGateway.findProductById(consumerId, item.producerProduct.id);
						} else {
							const newItem = new CartItem(consumer, product, req.body.quantity);
							consumer.cartItems.add(newItem);
							updatedItem = await container.cartItemGateway.findProductById(consumerId, newItem.producerProduct.id);
						}
						await container.consumerGateway.updateCart(consumer);
						res.status(201).json(updatedItem);
					} else {
						res.status(400).json({ error: 'Product out of stock' });
					}
				} else {
					res.status(404).json({ error: 'Product not found' });
				}
			} else {
				res.status(404).json({ error: 'Consumer not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Delete('/:consumerId/cart', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			})
		})
	])
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

	@Put('/:consumerId/cart/:producerProductId', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1),
				producerProductId: Joi.number().integer().min(1)
			}),
			body: Joi.object({
				quantity: Joi.number().integer().min(1).required()
			})
		})
	])
	public async updateQuantityCartItem(
		@Response() res: Express.Response,
		@Request() req: Express.Request,
		@Params('consumerId') consumerId: number,
		@Params('producerProductId') producerProductId: number
	): Promise<void> {
		try {
			const consumer = await container.consumerGateway.findByIdWithCart(consumerId);

			if (consumer) {
				const product = await container.productGateway.findById(Number(producerProductId));

				if (product) {
					const items = consumer.cartItems.getItems();
					const item = items.find((item) => item.producerProduct.id === Number(producerProductId));

					if (item) {
						if (req.body.quantity <= product.stock) {
							item.quantity = req.body.quantity;
							await container.consumerGateway.updateCart(consumer);
							const updatedItem = await container.cartItemGateway.findProductById(consumerId, producerProductId);
							res.status(200).json(updatedItem);
						} else {
							res.status(400).json({ error: 'Not enough stock' });
						}
					} else {
						res.status(404).json({ error: 'Item not found' });
					}
				} else {
					res.status(404).json({ error: 'Product not found' });
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
