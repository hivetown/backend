import { Injectable } from '@decorators/di';
import { Controller, Delete, Get, Params, Post, Put, Query, Request, Response } from '@decorators/express';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import * as Express from 'express';
import { Joi, validate } from 'express-validation';
import { container } from '..';
import { Address, CartItem, Consumer, Order, User } from '../entities';
import { ShipmentStatus, UserType } from '../enums';
import { ConflictError } from '../errors/ConflictError';
import { AuthMiddleware } from '../middlewares/auth';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { convertExportOrderItem } from '../utils/convertExportOrderItem';
import type { ExportOrder } from '../interfaces/ExportOrder';
import type { ExportAddress } from '../interfaces/ExportAddress';
import { convertAddress } from '../utils/convertAdress';
import { NotFoundError } from '../errors/NotFoundError';
import { BadRequestError } from '../errors/BadRequestError';
import { createCheckoutSession } from '../utils/createCheckoutSession';
import { stripe } from '../stripe/key';

@Controller('/consumers')
@Injectable()
export class ConsumerController {
	@Get('/', [AuthMiddleware])
	public async getConsumers(@Response() res: Express.Response) {
		const consumers = await container.consumerGateway.findAll();
		return res.json(consumers);
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
	public async createConsumer(@Response() res: Express.Response, @Request() req: Express.Request) {
		const data: User = req.body;
		data.authId = req.authUser!.uid;
		data.email = req.authUser!.email!;

		data.type = UserType.Consumer;

		try {
			const user = await container.consumerGateway.create({ user: data } as Consumer);
			return res.status(201).json(user);
		} catch (error) {
			if (error instanceof UniqueConstraintViolationException) throw new ConflictError('Consumer already exists');
			throw error;
		}
	}

	// -------------------------------------------------------------------- CART --------------------------------------------------------------------

	@Get('/:consumerId/cart', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			}),
			query: Joi.object({
				page: Joi.number().integer().min(1),
				pageSize: Joi.number().integer().min(1)
			})
		}),
		AuthMiddleware
	])
	public async getCart(@Response() res: Express.Response, @Params('consumerId') consumerId: number, @Request() req: Express.Request) {
		const consumer = await container.consumerGateway.findByIdWithCart(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const items = await container.cartItemGateway.findAllItemsByConsumerId(consumerId, options);
		return res.status(200).json(items);
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
		}),
		AuthMiddleware
	])
	public async addCartItem(@Response() res: Express.Response, @Request() req: Express.Request, @Params('consumerId') consumerId: number) {
		const consumer = await container.consumerGateway.findByIdWithCart(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');

		const { quantity, producerProduct: producerProductId } = req.body as { quantity: number; producerProduct: number };
		const product = await container.producerProductGateway.findById(producerProductId);
		if (!product) throw new NotFoundError('Product not found');

		// Check if the product is in stock
		if (quantity > product.stock) throw new BadRequestError('Product out of stock');

		// Check if the product is already in the cart
		const items = consumer.cartItems.getItems();
		const item = items.find((item) => item.producerProduct.id === producerProductId);

		// If the item already exists, update the quantity
		if (item) item.quantity = quantity;
		// Otherwise, add a new item
		else consumer.cartItems.add(new CartItem(consumer, product, quantity));

		// Update the cart
		await container.consumerGateway.updateCart(consumer);

		// Return the updated item
		const updatedItem = await container.cartItemGateway.findProductById(consumerId, product.id);
		return res.status(201).json(updatedItem);
	}

	@Delete('/:consumerId/cart', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			})
		}),
		AuthMiddleware
	])
	public async deleteCart(@Response() res: Express.Response, @Params('consumerId') consumerId: number) {
		const consumer = await container.consumerGateway.findByIdWithCart(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');

		const cartItems = consumer.cartItems.getItems();
		await container.cartItemGateway.delete(cartItems);

		return res.status(204).send();
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
		}),
		AuthMiddleware
	])
	public async updateQuantityCartItem(
		@Response() res: Express.Response,
		@Request() req: Express.Request,
		@Params('consumerId') consumerId: number,
		@Params('producerProductId') _producerProductId: string
	) {
		const consumer = await container.consumerGateway.findByIdWithCart(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');

		const producerProductId = Number(_producerProductId);
		const product = await container.producerProductGateway.findById(producerProductId);
		if (!product) throw new NotFoundError('Product not found');

		const items = consumer.cartItems.getItems();
		const item = items.find((item) => item.producerProduct.id === producerProductId);
		if (!item) throw new NotFoundError('Item not found');

		const { quantity } = req.body as { quantity: number };
		if (quantity > product.stock) throw new BadRequestError('Product out of stock');

		item.quantity = quantity;
		await container.consumerGateway.updateCart(consumer);

		const updatedItem = await container.cartItemGateway.findProductById(consumerId, producerProductId);
		return res.status(200).json(updatedItem);
	}

	@Delete('/:consumerId/cart/:producerProductId', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1),
				producerProductId: Joi.number().integer().min(1)
			})
		}),
		AuthMiddleware
	])
	public async deleteCartItem(
		@Response() res: Express.Response,
		@Params('consumerId') consumerId: number,
		@Params('producerProductId') _producerProductId: string
	) {
		const consumer = await container.consumerGateway.findByIdWithCart(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');

		const producerProductId = Number(_producerProductId);
		const product = await container.producerProductGateway.findById(producerProductId);
		if (!product) throw new NotFoundError('Product not found');

		const items = consumer.cartItems.getItems();
		const item = items.find((item) => item.producerProduct.id === producerProductId);
		if (!item) throw new NotFoundError('Item not found');

		await container.cartItemGateway.deleteOne(item);
		return res.status(204).send();
	}

	// -------------------------------------------------------------------- ORDERS --------------------------------------------------------------------

	@Get('/:consumerId/orders', [
		validate({
			query: Joi.object({
				page: Joi.number().integer().min(1),
				pageSize: Joi.number().integer().min(1).max(100)
			}),
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			})
		}),
		AuthMiddleware
	])
	public async getOrders(@Response() res: Express.Response, @Request() req: Express.Request, @Params('consumerId') consumerId: number) {
		const consumer = await container.consumerGateway.findById(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const orders = await container.orderGateway.findByConsumer(consumerId, options);

		const result = new Array(orders.items.length);
		for (let i = 0; i < orders.items.length; i++) {
			const order = orders.items[i];
			result[i] = {
				id: order.id,
				shippingAddress: order.shippingAddress,
				generalStatus: order.getGeneralStatus(),
				totalPrice: order.getTotalPrice(),
				orderDate: order.getOrderDate()
			};
		}

		return res.status(200).json({
			items: result,
			totalItems: orders.totalItems,
			totalPages: orders.totalPages,
			page: orders.page,
			pageSize: orders.pageSize
		});
	}

	@Post('/:consumerId/orders', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			}),
			body: Joi.object({
				shippingAddressId: Joi.number().integer().min(1).required()
			})
		}),
		AuthMiddleware
	])
	public async createOrder(@Response() res: Express.Response, @Request() req: Express.Request, @Params('consumerId') consumerId: number) {
		const consumer = await container.consumerGateway.findByIdWithCartAndProducts(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');

		const address = consumer.addresses.getItems().find((address) => address.id === req.body.shippingAddressId);
		if (!address) throw new NotFoundError('Address not found for this consumer');

		if (!(consumer.cartItems.getItems().length > 0)) throw new BadRequestError('Cart is empty');
		const haveStock = consumer.existStockCartItems();

		if (!haveStock) throw new BadRequestError(`Not enough stock for the products with id: ${consumer.getProductsOutOfStock()}`);

		for (const item of consumer.cartItems.getItems()) {
			item.producerProduct.stock -= item.quantity;
		}
		const newOrder = new Order().create(consumer, address);
		const populatedNewOrder = await container.orderGateway.createOrder(newOrder); // cria a order
		const session = await createCheckoutSession(populatedNewOrder);
		res.status(201).json({ sessionId: session.id, checkout_url: session.url });
	}

	@Get('/:consumerId/orders/success', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			}),
			query: Joi.object({
				session_id: Joi.string().required()
			})
		})
	])
	public async successOrder(@Response() res: Express.Response, @Request() req: Express.Request, @Params('consumerId') consumerId: number) {
		const consumer = await container.consumerGateway.findById(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');
		// Para já esta a enviar todas as informações mas depois vai ser filtrado com o que é necessário
		const session = await stripe.checkout.sessions.retrieve(req.query.session_id as string);
		res.status(200).json(session);
	}

	@Get('/:consumerId/orders/cancel', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			}),
			query: Joi.object({
				session_id: Joi.string().required()
			})
		})
	])
	public PageCancelOrder(@Response() res: Express.Response, @Request() req: Express.Request) {
		res.json(`Sessão ${req.query.session_id} cancelada com sucesso.`);
	}

	@Post('/:consumerId/orders/cancel', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			}),
			query: Joi.object({
				session_id: Joi.string().required()
			})
		})
	])
	public async cancelOrder(@Response() res: Express.Response, @Request() req: Express.Request, @Params('consumerId') consumerId: number) {
		// Este é o cancelamento da order antes de ser paga (ou seja no frontend voltar para trás)
		const consumer = await container.consumerGateway.findById(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');

		await stripe.checkout.sessions.expire(req.query.session_id as string);
		res.json(`Sessão ${req.query.session_id} cancelada com sucesso.`);
	}

	@Get('/:consumerId/orders/export', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			}),
			query: Joi.object({
				id: Joi.array().items(Joi.number().integer().min(1)).required()
			})
		}),
		AuthMiddleware
	])
	public async exportOrders(@Response() res: Express.Response, @Params('consumerId') consumerId: number, @Query('id') ids: number[]) {
		const consumer = await container.consumerGateway.findById(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');

		const orders = await container.orderGateway.findByIdsToExport(ids, consumerId);
		if (!orders) throw new NotFoundError('Orders not found');

		const results = new Array(orders.length);
		for (let i = 0; i < orders.length; i++) {
			const order = orders[i];
			const newAddress: ExportAddress = convertAddress(order.shippingAddress);
			const newObj: ExportOrder = {
				id: order.id,
				shippingAddress: newAddress,
				generalStatus: order.getGeneralStatus(),
				totalPrice: order.getTotalPrice(),
				items: convertExportOrderItem(order.items)
			};
			results[i] = newObj;
		}

		const ordersJson = JSON.stringify(results);
		res.setHeader('Content-Type', 'application/json');
		res.setHeader('Content-Disposition', 'attachment; filename=orders.json');
		return res.status(200).send(ordersJson);
	}

	@Get('/:consumerId/orders/:orderId', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1),
				orderId: Joi.number().integer().min(1)
			})
		}),
		AuthMiddleware
	])
	public async getOrder(@Response() res: Express.Response, @Params('consumerId') consumerId: number, @Params('orderId') orderId: number) {
		const consumer = await container.consumerGateway.findById(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');

		const order = await container.orderGateway.findByConsumerAndOrder(consumerId, orderId);
		if (!order) throw new NotFoundError('Order not found');

		const orderRes = { id: order.id, shippingAddress: order.shippingAddress };
		return res.status(200).json({ order: orderRes, status: order.getGeneralStatus() });
	}

	@Delete('/:consumerId/orders/:orderId', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1),
				orderId: Joi.number().integer().min(1)
			})
		}),
		AuthMiddleware
	])
	public async deleteOrder(@Response() res: Express.Response, @Params('consumerId') consumerId: number, @Params('orderId') orderId: number) {
		const consumer = await container.consumerGateway.findById(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');

		const order = await container.orderGateway.findByConsumerAndOrder(consumerId, orderId);
		if (!order) throw new NotFoundError('Order not found for this consumer');
		const orderPopulated = (await container.orderGateway.findByIdPopulated(order.id))!;
		if (!orderPopulated.canCancel())
			throw new BadRequestError(`This order can not be canceled because is already at the state: ${order.getGeneralStatus()}`);

		for (const item of orderPopulated.items.getItems()) {
			item.producerProduct.stock += item.quantity;
		}
		order.addShipmentEvent(ShipmentStatus.Canceled, order.shippingAddress);

		await container.orderGateway.updateOrder(order);

		// tratar do refund
		const refund = await stripe.refunds.create({
			payment_intent: orderPopulated.payment,
			reason: 'requested_by_customer' // motivo do reembolso (opcional)
		});

		res.json({ message: 'Order canceled', refund });
	}

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
		}),
		AuthMiddleware
	])
	public async getOrderItems(
		@Response() res: Express.Response,
		@Request() req: Express.Request,
		@Params('consumerId') consumerId: number,
		@Params('orderId') orderId: number
	) {
		const consumer = await container.consumerGateway.findById(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const orderItems = await container.orderItemGateway.findByConsumerIDAndOrderId(consumerId, orderId, options);
		// pode ser assim porque não existem orders vazias, então ao verificar garantimos se a order é ou não do cliente
		if (!orderItems) throw new NotFoundError('Order not found');

		const items = new Array(orderItems.items.length);
		for (let i = 0; i < orderItems.items.length; i++) {
			const item = orderItems.items[i];
			const status = ShipmentStatus[item.shipment.getLastEvent().status];
			items[i] = { producerProduct: item.producerProduct, status, quantity: item.quantity, price: item.price };
		}

		return res.status(200).json({
			items,
			totalItems: orderItems.totalItems,
			totalPages: orderItems.totalPages,
			page: orderItems.page,
			pageSize: orderItems.pageSize
		});
	}

	@Get('/:consumerId/orders/:orderId/items/:producerProductId', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1),
				orderId: Joi.number().integer().min(1),
				producerProductId: Joi.number().integer().min(1)
			})
		}),
		AuthMiddleware
	])
	public async getOrderItem(
		@Response() res: Express.Response,
		@Params('consumerId') consumerId: number,
		@Params('orderId') orderId: number,
		@Params('producerProductId') producerProductId: number
	) {
		const consumer = await container.consumerGateway.findById(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');

		const order = await container.orderGateway.findById(orderId);
		if (!order) throw new NotFoundError('Order not found');
		if (order.consumer.user.id !== consumer.user.id) throw new NotFoundError('Order not found for this consumer');

		const item = await container.orderItemGateway.findByConsumerIdOrderIdProducerProductId(consumerId, orderId, producerProductId);
		if (!item) throw new NotFoundError('Order item not found');

		return res.status(200).json(item);
	}

	// -------------------------------------------------------------------- ADDRESSES --------------------------------------------------------------------
	@Get('/:consumerId/addresses', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().min(1).required()
			}),
			query: Joi.object({
				page: Joi.number().min(1),
				pageSize: Joi.number().min(1)
			})
		}),
		AuthMiddleware
	])
	public async getAddresses(@Request() req: Express.Request, @Response() res: Express.Response, @Params('consumerId') consumerId: number) {
		const consumer = await container.consumerGateway.findById(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const addresses = await container.addressGateway.findFromConsumer(consumer.user.id, options);
		return res.status(200).json(addresses);
	}

	@Post('/:consumerId/addresses', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().min(1).required()
			}),
			body: Joi.object({
				number: Joi.number().required(),
				door: Joi.string().required(),
				floor: Joi.number().required(),
				zipCode: Joi.string().required(),
				street: Joi.string().required(),
				parish: Joi.string().required(),
				county: Joi.string().required(),
				city: Joi.string().required(),
				district: Joi.string().required(),
				latitude: Joi.number().required(),
				longitude: Joi.number().required()
			})
		}),
		AuthMiddleware
	])
	public async addAddress(@Request() req: Express.Request, @Response() res: Express.Response, @Params('consumerId') consumerId: number) {
		const consumer = await container.consumerGateway.findById(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');

		const address: Address = req.body;
		address.consumer = consumer;

		const createdAddress = await container.addressGateway.create(address);
		return res.status(201).json(createdAddress);
	}
}
