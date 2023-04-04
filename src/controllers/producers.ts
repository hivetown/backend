import { Injectable } from '@decorators/di';
import type { Producer } from '../entities';
import { AuthMiddleware } from '../middlewares/auth';
import { container } from '..';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { ConflictError } from '../errors/ConflictError';
import { ApiError } from '../errors/ApiError';
import { Controller, Get, Params, Request, Response, Post } from '@decorators/express';
import * as Express from 'express';
import { Joi, validate } from 'express-validation';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { ShipmentStatus } from '../enums';

@Controller('/producers')
@Injectable()
export class ProducersController {
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
	public async createProducer(@Response() res: Express.Response, @Request() req: Express.Request): Promise<void> {
		try {
			const data: Producer = req.body;
			data.authId = req.authUser!.uid;
			data.email = req.authUser!.email!;

			const producer = await container.producerGateway.create(data);
			res.status(201).json(producer);
		} catch (error) {
			if (error instanceof UniqueConstraintViolationException) {
				throw new ConflictError('Producer already exists');
			}

			throw new ApiError((error as any).message, 500);
		}
	}

	@Get('/:producerId/orders', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required()
			}),
			query: Joi.object({
				page: Joi.number().min(1),
				pageSize: Joi.number().min(1)
			})
		})
	])
	public async getOrders(@Response() res: Express.Response, @Request() req: Express.Request, @Params('producerId') producerId: number) {
		try {
			const producer = await container.producerGateway.findById(producerId);

			if (producer) {
				const orderItems = await container.orderItemGateway.findOrdersByProducer(producerId);
				if (orderItems.length === 0) {
					res.status(404).json({ error: 'No orders found' });
				} else {
					const ordersId: number[] = [];
					orderItems.forEach((orderItem) => {
						ordersId.push(orderItem.order.id);
					});

					const options: PaginatedOptions = {
						page: Number(req.query.page) || -1,
						size: Number(req.query.pageSize) || -1
					};

					const orders = await container.orderGateway.findByIds(ordersId, options);
					res.status(200).json(orders);
				}
			} else {
				res.status(404).json({ error: 'Producer not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:producerId/orders/:orderId', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required(),
				orderId: Joi.number().min(1).required()
			})
		})
	])
	public async getOrder(@Response() res: Express.Response, @Params('producerId') producerId: number, @Params('orderId') orderId: number) {
		try {
			const producer = await container.producerGateway.findById(producerId);
			if (producer) {
				const orderItem = await container.orderItemGateway.findOrderByProducerAndOrderId(producerId, orderId);
				if (orderItem) {
					const order = await container.orderGateway.findByIdWithShippingAddress(orderId);
					const o = { id: order?.id, shippingAddress: order?.shippingAddress };
					res.status(200).json({ order: o, status: order?.getGeneralStatus() });
				} else {
					res.status(404).json({ error: 'Order not found in this Producer' });
				}
			} else {
				res.status(404).json({ error: 'Producer not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:producerId/orders/:orderId/items', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required(),
				orderId: Joi.number().min(1).required()
			}),
			query: Joi.object({
				page: Joi.number().min(1),
				pageSize: Joi.number().min(1)
			})
		})
	])
	public async getOrderItems(
		@Response() res: Express.Response,
		@Request() req: Express.Request,
		@Params('producerId') producerId: number,
		@Params('orderId') orderId: number
	) {
		try {
			const producer = await container.producerGateway.findById(producerId);
			if (producer) {
				const options: PaginatedOptions = {
					page: Number(req.query.page) || -1,
					size: Number(req.query.pageSize) || -1
				};
				const orderItems = await container.orderItemGateway.findByProducerAndOrderId(producerId, orderId, options);
				if (orderItems.totalItems > 0) {
					// pode ser assim porque não existem orders vazias, então ao verificar garantimos se a order é ou não do cliente

					const items = [];
					for (const orderItem of orderItems.items) {
						const status = ShipmentStatus[orderItem.shipment.getLastEvent().status];
						items.push({ producerProduct: orderItem.producerProduct, status, quantity: orderItem.quantity, price: orderItem.price });
					}
					res.status(200).json({
						items,
						totalItems: orderItems.totalItems,
						totalPages: orderItems.totalPages,
						page: orderItems.page,
						pageSize: orderItems.pageSize
					});
				} else {
					res.status(404).json({ error: 'Order not found for this producer' });
				}
			} else {
				res.status(404).json({ error: 'Producer not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:producerId/orders/:orderId/items/:producerProductId', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required(),
				orderId: Joi.number().min(1).required(),
				producerProductId: Joi.number().min(1).required()
			})
		})
	])
	public async getOrderItem(
		@Response() res: Express.Response,
		@Request() req: Express.Request,
		@Params('producerId') producerId: number,
		@Params('orderId') orderId: number,
		@Params('producerProductId') producerProductId: number
	) {
		try {
			const producer = await container.producerGateway.findById(producerId);
			if (producer) {
				const options: PaginatedOptions = {
					page: Number(req.query.page) || -1,
					size: Number(req.query.pageSize) || -1
				};
				const orderItems = await container.orderItemGateway.findByProducerAndOrderId(producerId, orderId, options);
				if (orderItems.totalItems > 0) {
					const orderItem = await container.orderItemGateway.findByProducerAndOrderAndProducerProduct(
						producerId,
						orderId,
						producerProductId
					);
					if (orderItem) {
						res.status(200).json({
							producerProduct: orderItem.producerProduct,
							quantity: orderItem.quantity,
							price: orderItem.price
						});
					} else {
						res.status(404).json({ error: 'Order item not found for this producer' });
					}
				} else {
					res.status(404).json({ error: 'Order not found for this producer' });
				}
			} else {
				res.status(404).json({ error: 'Producer not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:producerId/orders/:orderId/items/:producerProductId/shipment', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required(),
				orderId: Joi.number().min(1).required(),
				producerProductId: Joi.number().min(1).required()
			})
		})
	])
	public async getOrderItemShipment(
		@Response() res: Express.Response,
		@Request() req: Express.Request,
		@Params('producerId') producerId: number,
		@Params('orderId') orderId: number,
		@Params('producerProductId') producerProductId: number
	) {
		try {
			const producer = await container.producerGateway.findById(producerId);
			if (producer) {
				const options: PaginatedOptions = {
					page: Number(req.query.page) || -1,
					size: Number(req.query.pageSize) || -1
				};
				const orderItems = await container.orderItemGateway.findByProducerAndOrderId(producerId, orderId, options);
				if (orderItems.totalItems > 0) {
					const orderItem = await container.orderItemGateway.findByProducerAndOrderAndProducerProductWithShipment(
						producerId,
						orderId,
						producerProductId
					);
					if (orderItem) {
						res.status(200).json(orderItem.shipment);
					} else {
						res.status(404).json({ error: 'Order item not found for this producer' });
					}
				} else {
					res.status(404).json({ error: 'Order not found for this producer' });
				}
			} else {
				res.status(404).json({ error: 'Producer not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}
}
