import { Injectable } from '@decorators/di';
import { Controller, Get, Params, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { container } from '..';
import { Joi, validate } from 'express-validation';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';

@Controller('/producers')
@Injectable()
export class ProducerController {
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
					res.status(200).json({ order });
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

	// @Get('/:producerId/orders/:orderId/items')

	// @Get('/:producerId/orders/:orderId/items/:producerProductId')

	// @Get('/:producerId/orders/:orderId/items/:producerProductId/shipment')
}
