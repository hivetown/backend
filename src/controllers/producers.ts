import { Injectable } from '@decorators/di';
import * as Express from 'express';
import { Joi, validate } from 'express-validation';
import { container } from '..';
import type { ProducerProductOptions } from '../interfaces/ProducerProductOptions';
import { Controller, Delete, Get, Params, Post, Put, Request, Response } from '@decorators/express';
import { Notification, Carrier, Image, Producer, ProducerProduct, ProductionUnit, ShipmentEvent, User } from '../entities';
import { authenticationMiddleware, authorizationMiddleware } from '../middlewares';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { CarrierStatus, ShipmentStatus, UserType } from '../enums';
import { BadRequestError } from '../errors/BadRequestError';
import { Permission } from '../enums/Permission';
import { throwError } from '../utils/throw';
import { ForbiddenError } from '../errors/ForbiddenError';
import { Authentication } from '../external/Authentication';
import { hasPermissions } from '../utils/hasPermission';
import type { ProductionUnitFilters } from '../interfaces/ProductionUnitFilters';
import { StringSearchType } from '../enums/StringSearchType';
import type { CarrierFilters } from '../interfaces/CarrierFilters';

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
		authenticationMiddleware
	])
	public async createProducer(@Response() res: Express.Response, @Request() req: Express.Request) {
		const data: User = req.body;
		data.authId = req.authUser!.uid;
		data.email = req.authUser!.email!;

		data.type = UserType.Producer;

		try {
			await container.producerGateway.create({ user: data } as Producer);
			const producer = (await container.producerGateway.findByAuthId(req.authUser!.uid))!;

			const notification = await Notification.create(
				producer.user,
				producer.user,
				`Welcome to Hivetown!`,
				`We're so thrilled to have you here!`
			);
			await container.notificationGateway.create(notification);

			return res.status(201).json(producer);
		} catch (error) {
			if (error instanceof UniqueConstraintViolationException) throw new ConflictError('Producer already exists');
			throw error;
		}
	}

	@Get('/', [
		validate({
			query: Joi.object({
				page: Joi.number().integer().min(1),
				pageSize: Joi.number().integer().min(1),
				includeAll: Joi.boolean().optional()
			})
		}),
		async (req, res, next) => {
			if (req.query.includeAll) {
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				await authenticationMiddleware(req, res, () => {});
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				await authorizationMiddleware({ permissions: Permission.READ_OTHER_PRODUCER })(req, res, () => {});
			}
			next();
		}
	])
	public async getProducers(@Response() res: Express.Response, @Request() req: Express.Request) {
		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};
		let producers;
		if (req.query.includeAll) {
			producers = await container.producerGateway.findAllWithDeletedAt(options);
		}

		if (!producers) {
			producers = await container.producerGateway.findAll(options);
		}
		return res.json(producers);
	}

	@Delete('/:producerId', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.DELETE_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError('User may not interact with other producers', { user: user.id, producer: Number(req.params.producerId) })
					)
			]
		})
	])
	public async deleteProducer(@Response() res: Express.Response, @Params('producerId') producerId: number) {
		const producer = await container.producerGateway.findByIdPopulated(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const orderItems = await container.orderItemGateway.findByProducerIdPopulated(producerId);
		const canDelete = orderItems.every((orderItem) => {
			const orderStatus = orderItem.getActualStatus();
			return orderStatus === ShipmentStatus.Delivered || orderStatus === ShipmentStatus.Canceled;
		});

		if (!canDelete) throw new BadRequestError('Producer has active orders');

		for (const productionUnit of producer.productionUnits) {
			await container.productionUnitGateway.delete(productionUnit);
		}

		for (const producerProduct of producer.producerProducts) {
			await container.producerProductGateway.delete(producerProduct);
		}

		await container.producerGateway.delete(producer);

		await Authentication.updateUserStatus(true, producer.user);

		const notification = await Notification.create(
			producer.user,
			producer.user,
			'Bye-bye HiveTown',
			`We're sad to see you go :(\nYour account has been disabled. If you think this is a mistake, please contact us.`
		);
		await container.notificationGateway.create(notification);

		res.status(204).json();
	}

	@Put('/:producerId', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required()
			}),
			body: Joi.object({
				name: Joi.string().required(),
				email: Joi.string().email().required(),
				phone: Joi.string().required(),
				disableEmails: Joi.boolean().optional()
			}),
			query: Joi.object({
				includeAll: Joi.boolean().optional()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError('User may not interact with other producers', { user: user.id, producer: Number(req.params.producerId) })
					)
			]
		})
	])
	public async updateProducer(@Response() res: Express.Response, @Request() req: Express.Request, @Params('producerId') producerId: number) {
		let producer;
		if (req.query.includeAll && hasPermissions(req.user!, Permission.WRITE_OTHER_CONSUMER)) {
			producer = await container.producerGateway.findByIdWithDeletedAt(producerId);
		} else {
			producer = await container.producerGateway.findById(producerId);
		}

		if (!producer) throw new NotFoundError('Producer not found');

		producer.user.name = req.body.name;
		producer.user.email = req.body.email;
		producer.user.phone = req.body.phone;
		producer.user.disableEmails = Boolean(req.body.disableEmails);

		await container.producerGateway.update(producer);

		res.status(201).json(producer);
	}

	@Get('/:producerId', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required()
			}),
			query: Joi.object({
				includeAll: Joi.boolean().optional()
			})
		}),
		async (req, res, next) => {
			if (req.query.includeAll) {
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				await authenticationMiddleware(req, res, () => {});
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				await authorizationMiddleware({ permissions: Permission.READ_OTHER_PRODUCER })(req, res, () => {});
			}
			next();
		}
	])
	public async getProducer(@Response() res: Express.Response, @Params('producerId') producerId: number, @Request() req: Express.Request) {
		let producer;
		if (req.query.includeAll) {
			producer = await container.producerGateway.findByIdWithDeletedAt(producerId);
		}

		if (!producer) {
			producer = await container.producerGateway.findById(producerId);
		}

		if (!producer) throw new NotFoundError('Producer not found');

		return res.status(200).json(producer);
	}

	@Post('/:producerId/reativate', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError('User may not interact with other producers', { user: user.id, producer: Number(req.params.producerId) })
					)
			]
		})
	])
	public async reativateProducer(@Response() res: Express.Response, @Params('producerId') producerId: number) {
		const producer = await container.producerGateway.findByIdWithDeletedAt(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		producer.deletedAt = undefined;
		await container.producerGateway.update(producer);

		await Authentication.updateUserStatus(false, producer.user);

		for (const productionUnit of producer.productionUnits) {
			productionUnit.deletedAt = undefined;
			await container.productionUnitGateway.update(productionUnit);
		}

		for (const producerProduct of producer.producerProducts) {
			producerProduct.deletedAt = undefined;
			await container.producerProductGateway.update(producerProduct);
		}

		const notification = await Notification.create(
			producer.user,
			producer.user,
			'Welcome back to HiveTown!',
			`We're really glad to see you back! :)`
		);
		await container.notificationGateway.create(notification);

		res.status(201).json(producer);
	}

	@Get('/:producerId/products', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required()
			}),
			query: Joi.object({
				page: Joi.number().min(1).optional(),
				pageSize: Joi.number().min(1).optional(),
				orderBy: Joi.string().valid('currentPrice', 'name').optional()
			})
		})
	])
	public async producerProducts(@Response() res: Express.Response, @Request() req: Express.Request, @Params('producerId') producerId: number) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const options: ProducerProductOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1,
			populate: ['producerProduct.productSpec', 'producerProduct.productionUnit', 'producerProduct_productSpec.images'],
			orderBy: req.query.orderBy as any // as any is fine here because Joi validates the value
		};

		const producerProducts = await container.producerProductGateway.findAll({ producerId }, options);
		res.status(200).json(producerProducts);
	}

	@Post('/:producerId/products', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required()
			}),
			body: Joi.object({
				currentPrice: Joi.number().min(0).required(),
				productionDate: Joi.date().required(),
				stock: Joi.number().min(0).required(),
				productionUnitId: Joi.number().min(1).required(),
				productSpecId: Joi.number().min(1).required()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' products", { user: user.id, producer: Number(req.params.producerId) })
					)
			]
		})
	])
	public async createProducerProduct(@Response() res: Express.Response, @Request() req: Express.Request, @Params('producerId') producerId: number) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const productionUnit = await container.productionUnitGateway.findById(req.body.productionUnitId);
		if (!productionUnit) throw new NotFoundError('Production unit not found');

		const productSpec = await container.productSpecGateway.findById(req.body.productSpecId);
		if (!productSpec) throw new NotFoundError('Product spec not found');

		const productionDate = new Date(req.body.productionDate);

		const producerProduct = new ProducerProduct(req.body.currentPrice, productionDate, req.body.stock, producer, productionUnit, productSpec);
		await container.producerProductGateway.createOrUpdate(producerProduct);

		return res.status(201).json(producerProduct);
	}

	@Put('/:producerId/products/:producerProductId', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required(),
				producerProductId: Joi.number().min(1).required()
			}),
			body: Joi.object({
				currentPrice: Joi.number().min(0).required(),
				productionDate: Joi.date().required(),
				stock: Joi.number().min(0).required(),
				productionUnitId: Joi.number().min(1).required()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' products", { user: user.id, producer: Number(req.params.producerId) })
					)
			]
		})
	])
	public async updateProducerProduct(
		@Response() res: Express.Response,
		@Request() req: Express.Request,
		@Params('producerId') producerId: number,
		@Params('producerProductId') producerProductId: number
	) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const producerProduct = await container.producerProductGateway.findById(producerProductId);
		if (!producerProduct) throw new NotFoundError('Producer product not found');

		const productionUnit = await container.productionUnitGateway.findById(req.body.productionUnitId);
		if (!productionUnit) throw new NotFoundError('Production unit not found');

		producerProduct.currentPrice = req.body.currentPrice;
		producerProduct.productionDate = new Date(req.body.productionDate);
		producerProduct.stock = req.body.stock;
		producerProduct.productionUnit = productionUnit;

		await container.producerProductGateway.createOrUpdate(producerProduct);

		return res.status(201).json(producerProduct);
	}

	@Delete('/:producerId/products/:producerProductId', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required(),
				producerProductId: Joi.number().min(1).required()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' products", { user: user.id, producer: Number(req.params.producerId) })
					)
			]
		})
	])
	public async deleteProducerProduct(
		@Response() res: Express.Response,
		@Params('producerId') producerId: number,
		@Params('producerProductId') producerProductId: number
	) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const producerProduct = await container.producerProductGateway.findById(producerProductId);
		if (!producerProduct) throw new NotFoundError('Producer product not found');

		await container.producerProductGateway.delete(producerProduct);
		return res.status(204).json();
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
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.READ_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' orders", { user: user.id, producer: Number(req.params.producerId) })
					)
			]
		})
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
		const newItems: any[] = [];
		for (const order of orders.items) {
			const newOrder = {
				id: order.id,
				shippingAddress: order.shippingAddress,
				orderDate: order.getOrderDate(),
				status: order.getGeneralStatusForProducer(producerId)
			};

			newItems.push(newOrder);
		}

		return res.status(200).json({
			items: newItems,
			totalPages: orders.totalPages,
			page: orders.page,
			pageSize: orders.pageSize
		});
	}

	@Get('/:producerId/orders/:orderId', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required(),
				orderId: Joi.number().min(1).required()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.READ_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' orders", { user: user.id, producer: Number(req.params.producerId) })
					)
			]
		})
	])
	public async getOrder(@Response() res: Express.Response, @Params('producerId') producerId: number, @Params('orderId') orderId: number) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const orderItem = await container.orderItemGateway.findOrderByProducerAndOrderId(producerId, orderId);
		if (!orderItem) throw new NotFoundError('Order not found');

		const order = await container.orderGateway.findByIdWithShippingAddress(orderId);
		if (!order) throw new NotFoundError('Order not found');

		const orderRes = {
			id: order.id,
			shippingAddress: order.shippingAddress,
			orderDate: order.getOrderDate(),
			status: order.getGeneralStatusForProducer(producerId)
		};
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
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.READ_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' orders", { user: user.id, producer: Number(req.params.producerId) })
					)
			]
		})
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
			const orderDate = orderItem.getFirstDate();
			items[i] = { producerProduct: orderItem.producerProduct, status, orderDate, quantity: orderItem.quantity, price: orderItem.price };
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
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.READ_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' orders", { user: user.id, producer: Number(req.params.producerId) })
					)
			]
		})
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
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.READ_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' orders", { user: user.id, producer: Number(req.params.producerId) })
					)
			]
		})
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
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' orders", { user: user.id, producer: Number(req.params.producerId) })
					)
			]
		})
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

		const order = await container.orderGateway.findById(orderId);
		if (!order) throw new NotFoundError('Order not found');

		const orderItems = await container.orderItemGateway.findByProducerAndOrderId(producerId, orderId, options);
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

		// Create notification
		const notification = await Notification.create(order.consumer.user, producer.user, `Hivetown Shipment Update!`, newEvent.makeMessage());
		await container.notificationGateway.create(notification);

		await container.shipmentGateway.update(orderItem.shipment);

		// TODO shipmentEvent?
		return res.status(201).json(orderItem.shipment);
	}

	@Get('/:producerId/units', [
		validate({
			params: Joi.object({ producerId: Joi.number().required() }),
			query: Joi.object({
				search: Joi.string().optional(),
				page: Joi.number().min(1).optional(),
				pageSize: Joi.number().min(1).optional(),
				raio: Joi.number().min(1).optional(),
				addressId: Joi.number().min(1).optional() // ver se há outra opção
			})
		})
	])
	public async getUnits(@Request() req: Express.Request, @Response() res: Express.Response, @Params('producerId') producerId: number) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const filter: ProductionUnitFilters = { producerId: producer.user.id };
		if (req.query.search) filter.search = { type: StringSearchType.CONTAINS, value: req.query.search as string };
		if (req.query.raio && req.query.addressId) {
			const address = await container.addressGateway.findById(Number(req.query.addressId));
			if (!address) throw new NotFoundError('Address not found');
			filter.address = address;
			filter.raio = Number(req.query.raio);
		}

		const units = await container.productionUnitGateway.findFromProducer(filter, options);
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
		if (!productionUnit || productionUnit.producer.user.id !== producer.user.id) throw new NotFoundError('Production unit not found');

		return res.status(200).json(productionUnit);
	}

	@Post('/:producerId/units', [
		validate({
			params: Joi.object({ producerId: Joi.number().required() }),
			body: Joi.object({
				name: Joi.string().required(),
				address: Joi.number().required()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' production units", {
							user: user.id,
							producer: Number(req.params.producerId)
						})
					)
			]
		})
	])
	public async createProductionUnit(@Request() req: Express.Request, @Response() res: Express.Response, @Params('producerId') producerId: number) {
		const producer = await container.producerGateway.findByIdWithUnits(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const address = await container.addressGateway.findById(req.body.address);
		if (!address) throw new NotFoundError('Address not found');

		const newUnit = new ProductionUnit(req.body.name, address, producer);
		await container.productionUnitGateway.createOrUpdate(newUnit);

		return res.status(201).json(newUnit);
	}

	@Put('/:producerId/units/:unitId', [
		validate({
			params: Joi.object({
				producerId: Joi.number().required(),
				unitId: Joi.number().required()
			}),
			body: Joi.object({
				name: Joi.string().required(),
				address: Joi.number().required()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' production units", {
							user: user.id,
							producer: Number(req.params.producerId)
						})
					)
			]
		})
	])
	public async updateProductionUnit(
		@Request() req: Express.Request,
		@Response() res: Express.Response,
		@Params('producerId') producerId: number,
		@Params('unitId') unitId: number
	) {
		const producer = await container.producerGateway.findByIdWithUnits(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const productionUnit = producer.productionUnits.getItems().find((unit) => unit.id === Number(unitId));
		if (!productionUnit) throw new NotFoundError('Production unit not found for this producer');

		const address = await container.addressGateway.findById(req.body.address);
		if (!address) throw new NotFoundError('Address not found');

		productionUnit.name = req.body.name;
		productionUnit.address = address;

		const pu = await container.productionUnitGateway.createOrUpdate(productionUnit);

		return res.status(201).json(pu);
	}

	@Delete('/:producerId/units/:unitId', [
		validate({
			params: Joi.object({
				producerId: Joi.number().required(),
				unitId: Joi.number().required()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' production units", {
							user: user.id,
							producer: Number(req.params.producerId)
						})
					)
			]
		})
	])
	public async deleteProductionUnit(@Response() res: Express.Response, @Params('producerId') producerId: number, @Params('unitId') unitId: number) {
		const producer = await container.producerGateway.findByIdWithUnits(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const productionUnit = producer.productionUnits.getItems().find((unit) => unit.id === Number(unitId));
		if (!productionUnit) throw new NotFoundError('Production unit not found for this producer');

		await container.productionUnitGateway.delete(productionUnit);

		return res.status(204).send();
	}

	@Get('/:producerId/units/:unitId/products', [
		validate({
			params: Joi.object({
				producerId: Joi.number().required(),
				unitId: Joi.number().required()
			}),
			query: Joi.object({
				page: Joi.number().optional(),
				pageSize: Joi.number().optional()
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
		if (!productionUnit || productionUnit.producer.user.id !== producer.user.id) throw new NotFoundError('Production unit not found');

		const options: ProducerProductOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1,
			populate: ['producerProduct.productSpec', 'producerProduct_productSpec.images']
		};

		const products = await container.producerProductGateway.findFromProductionUnit(productionUnit.id, options);
		return res.status(200).json(products);
	}

	@Get('/:producerId/units/:unitId/carriers', [
		validate({
			params: Joi.object({
				producerId: Joi.number().required(),
				unitId: Joi.number().required()
			}),
			query: Joi.object({
				page: Joi.number().optional(),
				pageSize: Joi.number().optional(),
				status: Joi.string().valid('Available', 'Unavailable').optional()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.READ_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' production units", {
							user: user.id,
							producer: Number(req.params.producerId)
						})
					)
			]
		})
	])
	public async getProductionUnitCarriers(
		@Response() res: Express.Response,
		@Params('producerId') producerId: number,
		@Params('unitId') unitId: number,
		@Request() req: Express.Request
	) {
		const producer = await container.producerGateway.findByIdWithUnits(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const productionUnit = producer.productionUnits.getItems().find((unit) => unit.id === Number(unitId));
		if (!productionUnit) throw new NotFoundError('Production unit not found for this producer');

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const filters: CarrierFilters = {
			productionUnitId: productionUnit.id,
			status: req.query.status === 'Available' || req.query.status === 'Unavailable' ? req.query.status : undefined
		};

		const carriers = await container.carrierGateway.findFromProductionUnit(filters, options);

		return res.status(200).json(carriers);
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
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.READ_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' production units", {
							user: user.id,
							producer: Number(req.params.producerId)
						})
					)
			]
		})
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
		if (!productionUnit || productionUnit.producer.user.id !== producer.user.id) throw new NotFoundError('Production unit not found');

		const carrier = productionUnit.carriers.getItems().find((c) => c.id === Number(carrierId));
		if (!carrier) throw new NotFoundError('Carrier not found');

		if (carrier.status === CarrierStatus.Unavailable) throw new BadRequestError('Carrier is unavailable');

		const shipment = await container.shipmentGateway.findById(req.body.shipmentId);
		if (!shipment) throw new NotFoundError('Shipment not found');

		shipment.carrier = carrier;
		const newEvent = new ShipmentEvent().create(shipment, ShipmentStatus.Processing, productionUnit.address);
		shipment.events.add(newEvent);

		await container.shipmentGateway.update(shipment);

		return res.status(201).json(shipment);
	}

	@Get('/:producerId/carriers', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required()
			}),
			query: Joi.object({
				page: Joi.number().min(1).optional(),
				pageSize: Joi.number().min(1).optional()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.READ_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' production units", {
							user: user.id,
							producer: Number(req.params.producerId)
						})
					)
			]
		})
	])
	public async getCarriersOfProducer(@Request() req: Express.Request, @Response() res: Express.Response, @Params('producerId') producerId: number) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const carriers = await container.carrierGateway.findAllByProducerId(producer.user.id, options);

		return res.status(200).json(carriers);
	}

	@Post('/:producerId/carriers', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required()
			}),
			body: Joi.object({
				licensePlate: Joi.string().required(),
				image: Joi.object({
					name: Joi.string().required(),
					url: Joi.string().required(),
					alt: Joi.string().required()
				}).required(),
				productionUnitId: Joi.number().min(1).required()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' production units", {
							user: user.id,
							producer: Number(req.params.producerId)
						})
					)
			]
		})
	])
	public async createCarrier(@Request() req: Express.Request, @Response() res: Express.Response, @Params('producerId') producerId: number) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const productionUnit = await container.productionUnitGateway.findOneFromProducer(producer.user.id, req.body.productionUnitId);
		if (!productionUnit) throw new NotFoundError('Production unit not found');

		const carrier = new Carrier(req.body.licensePlate, productionUnit, new Image(req.body.image.name, req.body.image.url, req.body.image.alt));
		await container.carrierGateway.createOrUpdate(carrier);

		return res.status(201).json(carrier);
	}

	@Get('/:producerId/carriers/:carrierId', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required(),
				carrierId: Joi.number().min(1).required()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.READ_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' production units", {
							user: user.id,
							producer: Number(req.params.producerId)
						})
					)
			]
		})
	])
	public async getCarrierOfProducer(
		@Response() res: Express.Response,
		@Params('producerId') producerId: number,
		@Params('carrierId') carrierId: number
	) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const carrier = await container.carrierGateway.findOneOfProducer(producer.user.id, carrierId);
		if (!carrier) throw new NotFoundError('Carrier not found');

		return res.status(200).json({
			id: carrier.id,
			licensePlate: carrier.licensePlate,
			status: carrier.status,
			image: carrier.image,
			productionUnit: carrier.productionUnit,
			lastShipmentEvent: carrier.getLastShipmentEvent()
		});
	}

	@Put('/:producerId/carriers/:carrierId', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required(),
				carrierId: Joi.number().min(1).required()
			}),
			body: Joi.object({
				image: Joi.object({
					name: Joi.string().required(),
					url: Joi.string().required(),
					alt: Joi.string().required()
				}).required(),
				productionUnitId: Joi.number().min(1).required(),
				status: Joi.string().valid(CarrierStatus.Available, CarrierStatus.Unavailable).required()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' production units", {
							user: user.id,
							producer: Number(req.params.producerId)
						})
					)
			]
		})
	])
	public async updateCarrierOfProducer(
		@Request() req: Express.Request,
		@Response() res: Express.Response,
		@Params('producerId') producerId: number,
		@Params('carrierId') carrierId: number
	) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const carrier = await container.carrierGateway.findOneOfProducer(producer.user.id, carrierId);
		if (!carrier) throw new NotFoundError('Carrier not found');

		const productionUnit = await container.productionUnitGateway.findOneFromProducer(producer.user.id, req.body.productionUnitId);
		if (!productionUnit) throw new NotFoundError('Production unit not found');

		carrier.image = new Image(req.body.image.name, req.body.image.url, req.body.image.alt);
		carrier.productionUnit = productionUnit;
		carrier.status = req.body.status;
		await container.carrierGateway.createOrUpdate(carrier);

		return res.status(200).json(carrier);
	}

	@Delete('/:producerId/carriers/:carrierId', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required(),
				carrierId: Joi.number().min(1).required()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_PRODUCER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.producerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' production units", {
							user: user.id,
							producer: Number(req.params.producerId)
						})
					)
			]
		})
	])
	public async deleteCarrierOfProducer(
		@Response() res: Express.Response,
		@Params('producerId') producerId: number,
		@Params('carrierId') carrierId: number
	) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const carrier = await container.carrierGateway.findOneOfProducer(producer.user.id, carrierId);
		if (!carrier) throw new NotFoundError('Carrier not found');

		if (carrier.status === CarrierStatus.Unavailable) throw new BadRequestError('Carrier is unavailable so it cannot be deleted');

		carrier.deletedAt = new Date();
		await container.carrierGateway.createOrUpdate(carrier);

		return res.status(204).send();
	}
}
