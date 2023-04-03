import { Injectable } from '@decorators/di';
import { Controller, Delete, Get, Params, Post, Put, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { Joi, validate } from 'express-validation';
import { container } from '..';
import { CartItem } from '../entities';
import { ShipmentStatus } from '../enums';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
// import * as fs from 'fs';
import { convertExportOrderItem } from '../utils/convertExportOrderItem';

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
			const consumer = await container.consumerGateway.findByIdWithCart(consumerId);

			if (consumer) {
				const options: PaginatedOptions = {
					page: Number(req.query.page) || -1,
					size: Number(req.query.pageSize) || -1
				};

				const items = await container.cartItemGateway.findAllItemsByConsumerId(consumerId, options);

				res.status(200).json(items);
			} else {
				res.status(404).json({ error: 'Consumer not found' });
			}
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

	@Get('/:consumerId/orders', [
		validate({
			query: Joi.object({
				page: Joi.number().integer().min(1),
				pageSize: Joi.number().integer().min(1).max(100)
			}),
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			})
		})
	])
	public async getOrders(
		@Response() res: Express.Response,
		@Request() req: Express.Request,
		@Params('consumerId') consumerId: number
	): Promise<void> {
		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		try {
			const consumer = await container.consumerGateway.findById(consumerId);
			if (consumer) {
				const orders = await container.orderGateway.findByConsumer(consumerId, options);
				res.status(200).json(orders);
			} else {
				res.status(404).json({ error: 'Consumer not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	// @Post('/:consumerId/orders')

	@Get('/:consumerId/orders/export', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			}),
			query: Joi.object({
				orderIds: Joi.array().items(Joi.number().integer().min(1)).required()
			})
		})
	])
	public async exportOrders(
		@Response() res: Express.Response,
		@Request() req: Express.Request,
		@Params('consumerId') consumerId: number
	): Promise<void> {
		try {
			const consumer = await container.consumerGateway.findById(consumerId);
			if (consumer) {
				const orderIds = (req.query.orderIds as string[]).map((id: string) => Number(id));
				const os = await container.orderGateway.findByIdsToExport(orderIds, consumerId);

				// ver como fazer no caso de houver por exemplo 1 order bem posta, e outra não
				if (os.length > 0) {
					// res.status(200).json(orders);
					const results = new Array(os.length);
					let i = 0;
					for (const o of os) {
						const newObj = {
							id: o.id,
							shippingAddress: o.shippingAddress,
							generalStatus: o.getGeneralStatus(),
							totalPrice: o.getTotalPrice(),
							items: convertExportOrderItem(o.items)
						};
						results[i] = newObj;
						i++;
					}
					// res.status(200).json(results);
					// fs.writeFile('orders.json', JSON.stringify(results), 'utf8', (err) => {
					// 	if (err) {
					// 		console.error(err);
					// 		res.status(500).send('Erro ao criar o arquivo de orders.');
					// 	} else {
					// 		res.download(JSON.stringify(results));
					// 	}
					// });
					const ordersJson = JSON.stringify(results);
					res.setHeader('Content-Type', 'application/json');
					res.setHeader('Content-Disposition', 'attachment; filename=orders.json');
					res.send(ordersJson);
				} else {
					res.status(404).json({ error: 'Orders not found for this consumer' });
				}
			} else {
				res.status(404).json({ error: 'Consumer not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:consumerId/orders/:orderId', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1),
				orderId: Joi.number().integer().min(1)
			})
		})
	])
	public async getOrder(
		@Response() res: Express.Response,
		@Params('consumerId') consumerId: number,
		@Params('orderId') orderId: number
	): Promise<void> {
		try {
			const consumer = await container.consumerGateway.findById(consumerId);
			if (consumer) {
				const order = await container.orderGateway.findByConsumerAndOrder(consumerId, orderId);
				if (order) {
					const o = { id: order.id, shippingAddress: order.shippingAddress };
					res.status(200).json({ order: o, status: order.getGeneralStatus() });
				} else {
					res.status(404).json({ error: 'Order not found for this consumer' });
				}
			} else {
				res.status(404).json({ error: 'Consumer not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	// @Delete('/:consumerId/orders/:orderId')

	@Get('/:consumerId/orders/:orderId/items', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1),
				orderId: Joi.number().integer().min(1)
			}),
			query: Joi.object({
				page: Joi.number().integer().min(1),
				pageSize: Joi.number().integer().min(1).max(100)
			})
		})
	])
	public async getOrderItems(
		@Response() res: Express.Response,
		@Request() req: Express.Request,
		@Params('consumerId') consumerId: number,
		@Params('orderId') orderId: number
	): Promise<void> {
		try {
			const consumer = await container.consumerGateway.findById(consumerId);

			if (consumer) {
				const options: PaginatedOptions = {
					page: Number(req.query.page) || -1,
					size: Number(req.query.pageSize) || -1
				};
				const result = await container.orderItemGateway.findByConsumerIDAndOrderId(consumerId, orderId, options);

				if (result.items.length > 0) {
					// pode ser assim porque não existem orders vazias, então ao verificar garantimos se a order é ou não do cliente
					const items = new Array(result.items.length);
					for (const item of result.items) {
						const status = ShipmentStatus[item.shipment.getLastEvent().status];
						items.push({ producerProduct: item.producerProduct, status, quantity: item.quantity, price: item.price });
					}

					res.status(200).json({
						items,
						totalItems: result.totalItems,
						totalPages: result.totalPages,
						page: result.page,
						pageSize: result.pageSize
					});
				} else {
					res.status(404).json({ error: 'Order not found for this consumer' });
				}
			} else {
				res.status(404).json({ error: 'Consumer not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:consumerId/orders/:orderId/items/:producerProductId', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1),
				orderId: Joi.number().integer().min(1),
				producerProductId: Joi.number().integer().min(1)
			})
		})
	])
	public async getOrderItem(
		@Response() res: Express.Response,
		@Params('consumerId') consumerId: number,
		@Params('orderId') orderId: number,
		@Params('producerProductId') producerProductId: number
	): Promise<void> {
		try {
			const consumer = await container.consumerGateway.findById(consumerId);
			if (consumer) {
				const order = await container.orderGateway.findById(orderId);
				if (order) {
					if (order.consumer.id === consumer.id) {
						const item = await container.orderItemGateway.findByConsumerIdOrderIdProducerProductId(
							consumerId,
							orderId,
							producerProductId
						);
						if (item) {
							res.status(200).json(item);
						} else {
							res.status(404).json({ error: 'This product does not exist for this order' });
						}
					} else {
						res.status(404).json({ error: 'Order not found for this consumer' });
					}
				} else {
					res.status(404).json({ error: 'Order not found' });
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
