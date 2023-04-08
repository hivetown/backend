import { Injectable } from '@decorators/di';
import { Controller, Get, Params, Post, Request, Response } from '@decorators/express';
import { Joi, validate } from 'express-validation';
import * as Express from 'express';
import { Producer, ShipmentStatus } from '../entities';
import { AuthMiddleware } from '../middlewares/auth';
import { container } from '..';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { ConflictError } from '../errors/ConflictError';
import { ApiError } from '../errors/ApiError';
import { NotFoundError } from '../errors/NotFoundError';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';

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

	@Get('/:producerId/units', [
		validate({
			params: Joi.object({ producerId: Joi.number().required() })
		}),
		AuthMiddleware
	])
	public async getUnits(
		@Request() req: Express.Request,
		@Response() res: Express.Response,
		@Params('producerId') producerId: number
	): Promise<void> {
		try {
			const producer = await container.producerGateway.findById(producerId);

			if (!producer) {
				throw new NotFoundError('Producer not found');
			}

			const options: PaginatedOptions = {
				page: Number(req.query.page) || -1,
				size: Number(req.query.pageSize) || -1
			};

			res.json(await container.productionUnitGateway.findFromProducer(producer.id, options));
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
		}),
		AuthMiddleware
	])
	public async getOrders(@Response() res: Express.Response, @Request() req: Express.Request, @Params('producerId') producerId: number) {
		try {
			const producer = await container.producerGateway.findById(producerId);

			if (producer) {
				const orderItems = await container.orderItemGateway.findOrdersByProducer(producerId);
				if (orderItems.length === 0) {
					res.status(404).json({ error: 'No orders found' });
				} else {
					const ordersId: number[] = new Array(orderItems.length);
					for (let i = 0; i < orderItems.length; i++) {
						ordersId[i] = orderItems[i].order.id;
					}

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

	@Get('/:producerId/units/:unitId', [
		validate({
			params: Joi.object({
				producerId: Joi.number().required(),
				unitId: Joi.number().required()
			})
		})
	])
	public async getUnit(
		@Response() res: Express.Response,
		@Params('producerId') producerId: number,
		@Params('unitId') unitId: number
	): Promise<void> {
		const producer = await container.producerGateway.findById(producerId);

		if (!producer) {
			throw new NotFoundError('Producer not found');
		}

		const productionUnit = await container.productionUnitGateway.findById(unitId);

		if (!productionUnit || productionUnit.producer.id !== producer.id) {
			throw new NotFoundError('Production unit not found');
		}

		res.json(productionUnit);
	}

	@Get('/:producerId/orders/:orderId', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required(),
				orderId: Joi.number().min(1).required()
			})
		}),
		AuthMiddleware
	])
	public async getOrder(@Response() res: Express.Response, @Params('producerId') producerId: number, @Params('orderId') orderId: number) {
		try {
			const producer = await container.producerGateway.findById(producerId);
			if (producer) {
				const orderItem = await container.orderItemGateway.findOrderByProducerAndOrderId(producerId, orderId);
				if (orderItem) {
					const order = await container.orderGateway.findByIdWithShippingAddress(orderId);
					const o = { id: order?.id, shippingAddress: order?.shippingAddress, status: order?.getGeneralStatusForProducer(producerId) };
					console.log(order?.getGeneralStatusForProducer(producerId));
					res.status(200).json(o);
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

	@Get('/:producerId/units/:unitId/products', [
		validate({
			params: Joi.object({
				producerId: Joi.number().required(),
				unitId: Joi.number().required()
			})
		})
	])
	public async getProductionUnitProducts(
		@Response() res: Express.Response,
		@Params('producerId') producerId: number,
		@Params('unitId') unitId: number,
		@Request() req: Express.Request
	): Promise<void> {
		const producer = await container.producerGateway.findById(producerId);

		if (!producer) {
			throw new NotFoundError('Producer not found');
		}

		const productionUnit = await container.productionUnitGateway.findById(unitId);

		if (!productionUnit || productionUnit.producer.id !== producer.id) {
			throw new NotFoundError('Production unit not found');
		}

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		res.json(await container.producerProductGateway.findFromProductionUnit(productionUnit.id, options));
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
		}),
		AuthMiddleware
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
		}),
		AuthMiddleware
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
						res.status(404).json({ error: 'Order item not found for this producer or Product not found for this Order Item' });
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
		}),
		AuthMiddleware
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
