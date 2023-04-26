import { Injectable } from '@decorators/di';
import { Controller, Get, Params, Post, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { Joi, validate } from 'express-validation';
import { container } from '..';
import type { ProducerProductOptions } from '../interfaces/ProducerProductOptions';
import { Producer, ShipmentEvent, ShipmentStatus } from '../entities';
import { AuthMiddleware } from '../middlewares/auth';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { CarrierStatus } from '../enums';
import { BadRequestError } from '../errors/BadRequestError';

const producerIdParam = Joi.number().min(1).required();
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
	public async createProducer(@Response() res: Express.Response, @Request() req: Express.Request) {
		const data: Producer = req.body;
		data.authId = req.authUser!.uid;
		data.email = req.authUser!.email!;

		let producer: Producer | null = null;
		try {
			producer = await container.producerGateway.create(data);
		} catch (error) {
			if (error instanceof UniqueConstraintViolationException) throw new ConflictError('Producer already exists');
		}

		return res.status(201).json(producer);
	}

	@Get('/:producerId/products', [
		validate({
			params: Joi.object({
				producerId: producerIdParam
			})
		})
	])
	public async producerProducts(@Response() res: Express.Response, @Request() req: Express.Request, @Params('producerId') producerId: number) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const options: ProducerProductOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1,
			populate: ['productSpec', 'productionUnit']
		};

		const producerProducts = await container.producerProductGateway.findAll({ producerId }, options);
		res.status(200).json(producerProducts);
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
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const orderItems = await container.orderItemGateway.findOrdersByProducer(producerId);
		const ordersId: number[] = new Array(orderItems.length);
		for (let i = 0; i < orderItems.length; i++) {
			ordersId[i] = orderItems[i].order.id;
		}

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const orders = await container.orderGateway.findByIds(ordersId, options);
		return res.status(200).json(orders);
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
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const orderItem = await container.orderItemGateway.findOrderByProducerAndOrderId(producerId, orderId);
		if (!orderItem) throw new NotFoundError('Order not found');

		const order = await container.orderGateway.findByIdWithShippingAddress(orderId);
		if (!order) throw new NotFoundError('Order not found');

		const orderRes = { id: order.id, shippingAddress: order.shippingAddress, status: order.getGeneralStatusForProducer(producerId) };
		return res.status(200).json(orderRes);
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
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const orderItems = await container.orderItemGateway.findByProducerAndOrderId(producerId, orderId, options);
		// pode ser assim porque não existem orders vazias, então ao verificar garantimos se a order é ou não do cliente
		if (!orderItems.totalItems) throw new NotFoundError('Order not found');

		const items = new Array(orderItems.items.length);
		for (let i = 0; i < orderItems.items.length; i++) {
			const orderItem = orderItems.items[i];
			const status = ShipmentStatus[orderItem.shipment.getLastEvent().status];
			items[i] = { producerProduct: orderItem.producerProduct, status, quantity: orderItem.quantity, price: orderItem.price };
		}

		return res.status(200).json({
			items,
			totalItems: orderItems.totalItems,
			totalPages: orderItems.totalPages,
			page: orderItems.page,
			pageSize: orderItems.pageSize
		});
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
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const orderItems = await container.orderItemGateway.findByProducerAndOrderId(producerId, orderId, options);
		// pode ser assim porque não existem orders vazias, então ao verificar garantimos se a order é ou não do cliente
		if (!orderItems.totalItems) throw new NotFoundError('Order not found');

		const orderItem = await container.orderItemGateway.findByProducerAndOrderAndProducerProduct(producerId, orderId, producerProductId);
		if (!orderItem) throw new NotFoundError('Order item not found');

		return res.status(200).json({
			producerProduct: orderItem.producerProduct,
			quantity: orderItem.quantity,
			price: orderItem.price
		});
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
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const orderItems = await container.orderItemGateway.findByProducerAndOrderId(producerId, orderId, options);
		// pode ser assim porque não existem orders vazias, então ao verificar garantimos se a order é ou não do cliente
		if (!orderItems.totalItems) throw new NotFoundError('Order not found');

		const orderItem = await container.orderItemGateway.findByProducerAndOrderAndProducerProductWithShipment(
			producerId,
			orderId,
			producerProductId
		);

		if (!orderItem) throw new NotFoundError('Order item not found');

		return res.status(200).json(orderItem.shipment);
	}

	@Post('/:producerId/orders/:orderId/items/:producerProductId/shipment/events', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required(),
				orderId: Joi.number().min(1).required(),
				producerProductId: Joi.number().min(1).required()
			}),
			body: Joi.object({
				status: Joi.string()
					.valid(...Object.keys(ShipmentStatus)) // Processing, Shipped, Delivered
					.required(),
				addressId: Joi.number().min(1).required()
			})
		}),
		AuthMiddleware
	])
	public async createOrderItemShipmentEvent(
		@Request() req: Express.Request,
		@Response() res: Express.Response,
		@Params('producerId') producerId: number,
		@Params('orderId') orderId: number,
		@Params('producerProductId') producerProductId: number
	) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const orderItems = await container.orderItemGateway.findByProducerAndOrderId(producerId, orderId, options);
		// pode ser assim porque não existem orders vazias, então ao verificar garantimos se a order é ou não do cliente
		if (!orderItems.totalItems) throw new NotFoundError('Order not found');

		const orderItem = await container.orderItemGateway.findByProducerAndOrderAndProducerProductWithShipment(
			producerId,
			orderId,
			producerProductId
		);

		if (!orderItem) throw new NotFoundError('Order item not found');

		const address = await container.addressGateway.findById(req.body.addressId);
		if (!address) throw new NotFoundError('Address not found');

		const status = ShipmentStatus[req.body.status as keyof typeof ShipmentStatus];

		const newEvent = new ShipmentEvent().create(orderItem.shipment, status, address);
		orderItem.shipment.events.add(newEvent);

		await container.shipmentGateway.update(orderItem.shipment);

		return res.status(200).json(orderItem.shipment);
	}

	@Get('/:producerId/units', [
		validate({
			params: Joi.object({ producerId: Joi.number().required() })
		}),
		AuthMiddleware
	])
	public async getUnits(@Request() req: Express.Request, @Response() res: Express.Response, @Params('producerId') producerId: number) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const units = await container.productionUnitGateway.findFromProducer(producer.id, options);
		return res.status(200).json(units);
	}

	@Get('/:producerId/units/:unitId', [
		validate({
			params: Joi.object({
				producerId: Joi.number().required(),
				unitId: Joi.number().required()
			})
		})
	])
	public async getUnit(@Response() res: Express.Response, @Params('producerId') producerId: number, @Params('unitId') unitId: number) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const productionUnit = await container.productionUnitGateway.findById(unitId);
		if (!productionUnit || productionUnit.producer.id !== producer.id) throw new NotFoundError('Production unit not found');

		return res.status(200).json(productionUnit);
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
	) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const productionUnit = await container.productionUnitGateway.findById(unitId);
		if (!productionUnit || productionUnit.producer.id !== producer.id) throw new NotFoundError('Production unit not found');

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const products = await container.producerProductGateway.findFromProductionUnit(productionUnit.id, options);
		return res.status(200).json(products);
	}

	@Post('/:producerId/units/:unitId/carriers/:carrierId/shipments', [
		validate({
			params: Joi.object({
				producerId: Joi.number().required(),
				unitId: Joi.number().required(),
				carrierId: Joi.number().required()
			}),
			body: Joi.object({
				shipmentId: Joi.number().required()
			})
		}),
		AuthMiddleware
	])
	public async associateShipment(
		@Request() req: Express.Request,
		@Response() res: Express.Response,
		@Params('producerId') producerId: number,
		@Params('unitId') unitId: number,
		@Params('carrierId') carrierId: number
	) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const productionUnit = await container.productionUnitGateway.findByIdPopulated(unitId);
		if (!productionUnit || productionUnit.producer.id !== producer.id) throw new NotFoundError('Production unit not found');

		const carrier = productionUnit.carriers.getItems().find((c) => c.id === Number(carrierId));
		if (!carrier) throw new NotFoundError('Carrier not found');

		if (carrier.status === CarrierStatus.Unavailable) throw new BadRequestError('Carrier is unavailable');

		const shipment = await container.shipmentGateway.findById(req.body.shipmentId);
		if (!shipment) throw new NotFoundError('Shipment not found');

		shipment.carrier = carrier;
		const newEvent = new ShipmentEvent().create(shipment, ShipmentStatus.Processing, productionUnit.address);
		shipment.events.add(newEvent);

		await container.shipmentGateway.update(shipment);

		return res.status(200).json(shipment);
	}
}
