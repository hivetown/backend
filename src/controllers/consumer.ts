import { Injectable } from '@decorators/di';
import { Controller, Delete, Get, Params, Post, Put, Query, Request, Response } from '@decorators/express';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import * as Express from 'express';
import { Joi, validate } from 'express-validation';
import { container } from '..';
import { Address, CartItem, Consumer, Order, User } from '../entities';
import { ShipmentStatus, UserType } from '../enums';
import { ConflictError } from '../errors/ConflictError';
import { authenticationMiddleware, authorizationMiddleware } from '../middlewares';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { convertExportOrderItem } from '../utils/convertExportOrderItem';
import type { ExportOrder } from '../interfaces/ExportOrder';
import type { ExportAddress } from '../interfaces/ExportAddress';
import { convertAddress } from '../utils/convertAdress';
import { NotFoundError } from '../errors/NotFoundError';
import { BadRequestError } from '../errors/BadRequestError';
import { createCheckoutSession } from '../utils/createCheckoutSession';
import { stripe } from '../stripe/key';
import { Permission } from '../enums/Permission';
import { throwError } from '../utils/throw';
import { ForbiddenError } from '../errors/ForbiddenError';
import { Authentication } from '../external/Authentication';
import { hasPermissions } from '../utils/hasPermission';
import { calcularDistancia } from '../utils/calculateDistance';
import { filterOrderItemsByDate } from '../utils/filterReportDate';
import { handleReportEvolution } from '../utils/handleReportEvolution';

@Controller('/consumers')
@Injectable()
export class ConsumerController {
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

	@Get('/', [
		validate({
			query: Joi.object({
				page: Joi.number().integer().min(1),
				pageSize: Joi.number().integer().min(1),
				includeAll: Joi.boolean().optional()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({ permissions: Permission.READ_OTHER_CONSUMER })
	])
	public async getConsumers(@Response() res: Express.Response, @Request() req: Express.Request) {
		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		let consumers;
		if (req.query.includeAll && hasPermissions(req.user!, Permission.READ_OTHER_CONSUMER)) {
			consumers = await container.consumerGateway.findAllWithDeletedAt(options);
		} else {
			consumers = await container.consumerGateway.findAll(options);
		}

		return res.json(consumers);
	}

	@Get('/:consumerId', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			}),
			query: Joi.object({
				includeAll: Joi.boolean().optional()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.READ_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError('User may not interact with other consumers', { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
		})
	])
	public async getConsumer(@Response() res: Express.Response, @Request() req: Express.Request, @Params('consumerId') consumerId: number) {
		let consumer;
		if (req.query.includeAll && hasPermissions(req.user!, Permission.READ_OTHER_CONSUMER)) {
			consumer = await container.consumerGateway.findByIdWithDeletedAtAndAddress(consumerId);
		} else {
			consumer = await container.consumerGateway.findByIdWithAddress(consumerId);
		}

		if (!consumer) throw new NotFoundError('Consumer not found');

		return res.status(200).json(consumer);
	}

	@Delete('/:consumerId', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.DELETE_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError('User may not interact with other consumers', { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
		})
	])
	public async deleteConsumer(@Response() res: Express.Response, @Params('consumerId') consumerId: number) {
		const consumer = await container.consumerGateway.findById(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');

		const orders = await container.orderGateway.findByConsumerIdPopulated(consumerId);
		const canDelete = orders.every((order) => {
			const orderStatus = ShipmentStatus[order.getGeneralStatus() as keyof typeof ShipmentStatus];
			return orderStatus === ShipmentStatus.Delivered || orderStatus === ShipmentStatus.Canceled;
		});

		if (!canDelete) throw new BadRequestError('Cannot delete consumer with active orders');

		await container.consumerGateway.delete(consumer);

		await Authentication.updateUserStatus(true, consumer.user);

		return res.status(204).send();
	}

	@Put('/:consumerId', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			}),
			body: Joi.object({
				name: Joi.string().required(),
				email: Joi.string().email().required(),
				phone: Joi.string().required()
			}),
			query: Joi.object({
				includeAll: Joi.boolean().optional()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.READ_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError('User may not interact with other consumers', { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
		})
	])
	public async updateConsumer(@Response() res: Express.Response, @Request() req: Express.Request, @Params('consumerId') consumerId: number) {
		let consumer;
		if (req.query.includeAll && hasPermissions(req.user!, Permission.READ_OTHER_CONSUMER)) {
			consumer = await container.consumerGateway.findByIdWithDeletedAt(consumerId);
		} else {
			consumer = await container.consumerGateway.findById(consumerId);
		}

		if (!consumer) throw new NotFoundError('Consumer not found');

		consumer.user.name = req.body.name;
		consumer.user.email = req.body.email;
		consumer.user.phone = req.body.phone;

		await container.consumerGateway.update(consumer);

		return res.status(201).json(consumer);
	}

	@Post('/:consumerId/reativate', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().min(1).required()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError('User may not interact with other consumers', { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
		})
	])
	public async reativateConsumer(@Response() res: Express.Response, @Params('consumerId') consumerId: number) {
		const consumer = await container.consumerGateway.findByIdWithDeletedAt(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');

		consumer.deletedAt = undefined;
		await container.consumerGateway.update(consumer);

		await Authentication.updateUserStatus(false, consumer.user);

		res.status(201).json(consumer);
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
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.READ_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' carts", { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
		})
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
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' carts", { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
		})
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
		await container.consumerGateway.update(consumer);

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
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.DELETE_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' carts", { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
		})
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
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' carts", { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
		})
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
		await container.consumerGateway.update(consumer);

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
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' carts", { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
		})
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
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.READ_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' orders", { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
		})
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
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' orders", { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
		})
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
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.READ_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' orders", { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
		})
	])
	public async successOrder(@Response() res: Express.Response, @Request() req: Express.Request, @Params('consumerId') consumerId: number) {
		const consumer = await container.consumerGateway.findById(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');
		// Para já esta a enviar todas as informações mas depois vai ser filtrado com o que é necessário
		const session = await stripe.checkout.sessions.retrieve(req.query.session_id as string);
		res.status(200).json(session);
	}

	@Post('/:consumerId/orders/cancel', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			}),
			query: Joi.object({
				session_id: Joi.string().required()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' orders", { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
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
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.READ_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' orders", { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
		})
	])
	public async exportOrders(@Response() res: Express.Response, @Params('consumerId') consumerId: number, @Query('id') ids: number[]) {
		const consumer = await container.consumerGateway.findById(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');
		console.log(consumer);

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

	@Get('/:consumerId/orders/report', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			}),
			query: Joi.object({
				categoryId: Joi.number().integer().min(1).optional(),
				// data: a ver melhor
				raio: Joi.number().integer().min(1).required()
			})
		}),
		authenticationMiddleware
	])
	public async report(@Response() res: Express.Response, @Request() req: Express.Request, @Params('consumerId') consumerId: number) {
		const consumer = await container.consumerGateway.findById(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');
		const resultado = [];
		const orderItems = await container.orderItemGateway.findAllByConsumerId(consumerId);

		for (const orderItem of orderItems) {
			const enderecoProduto = orderItem.producerProduct.productionUnit.address;
			const enderecoConsumidor = orderItem.order.shippingAddress;
			const distancia = calcularDistancia(enderecoProduto, enderecoConsumidor);
			// console.log(enderecoProduto.latitude, enderecoProduto.longitude);
			// console.log(enderecoConsumidor.latitude, enderecoConsumidor.longitude);
			// console.log(distancia);

			if (distancia <= Number(req.query.raio)) {
				resultado.push({
					producerProduct: orderItem.producerProduct,
					enderecoConsumidor,
					distancia
				});
			}
		}
		console.log(resultado.length);
		res.status(200).json(resultado);
	}

	@Get('/:consumerId/orders/report/flashcards', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			}),
			query: Joi.object({
				categoryId: Joi.number().integer().min(1).optional(),
				dataInicio: Joi.date().required(),
				dataFim: Joi.date().required(),
				raio: Joi.number().integer().min(1).required()
			})
		}),
		authenticationMiddleware
	])
	public async reportFlashcards(@Response() res: Express.Response, @Request() req: Express.Request, @Params('consumerId') consumerId: number) {
		const consumer = await container.consumerGateway.findById(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');

		let category = null;
		if (req.query.categoryId) {
			category = await container.categoryGateway.findById(Number(req.query.categoryId));
			if (!category) throw new NotFoundError('Category not found');
		}

		const encomendas: number[] = [];
		let totalProdutos = 0;
		let comprasTotais = 0;
		const produtosEncomendados = [];

		const orderItems = await container.orderItemGateway.findAllByConsumerId(consumerId);
		let orderItemsWithDate = orderItems.map((orderItem) => {
			return { orderItem, date: orderItem.order.getOrderDate() };
		});
		// console.log(orderItemsWithDate);
		// filtrar pelas datas
		if (req.query.dataInicio && req.query.dataFim) {
			orderItemsWithDate = filterOrderItemsByDate(orderItemsWithDate, req.query.dataInicio, req.query.dataFim);
		}

		for (const oi of orderItemsWithDate) {
			const { orderItem } = oi;
			const enderecoProduto = orderItem.producerProduct.productionUnit.address;
			const enderecoConsumidor = orderItem.order.shippingAddress;
			const distancia = calcularDistancia(enderecoProduto, enderecoConsumidor);

			if (distancia <= Number(req.query.raio)) {
				if (category) {
					const categoryIds = orderItem.producerProduct.productSpec.categories.toArray().map((c) => c.category.id);
					const isCategoryPresent = categoryIds.includes(category.id);
					if (isCategoryPresent) {
						encomendas.push(orderItem.order.id);
						totalProdutos += orderItem.quantity;
						comprasTotais += orderItem.quantity * orderItem.price;
						produtosEncomendados.push(orderItem.producerProduct.id);
					}
				} else {
					encomendas.push(orderItem.order.id);
					totalProdutos += orderItem.quantity;
					comprasTotais += orderItem.quantity * orderItem.price;
					produtosEncomendados.push(orderItem.producerProduct.id);
				}
			}
		}

		const numeroEncomendas = [...new Set(encomendas)].length;
		const numeroProdutosEncomendados = [...new Set(produtosEncomendados)].length;

		res.status(200).json({
			numeroEncomendas,
			totalProdutos,
			comprasTotais,
			numeroProdutosEncomendados
		});
	}

	@Get('/:consumerId/orders/report/map', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			}),
			query: Joi.object({
				categoryId: Joi.number().integer().min(1).optional(),
				dataInicio: Joi.date().required(),
				dataFim: Joi.date().required(),
				raio: Joi.number().integer().min(1).required()
			})
		}),
		authenticationMiddleware
	])
	public async reportMap(@Response() res: Express.Response, @Request() req: Express.Request, @Params('consumerId') consumerId: number) {
		const consumer = await container.consumerGateway.findById(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');

		let category = null;
		if (req.query.categoryId) {
			category = await container.categoryGateway.findById(Number(req.query.categoryId));
			if (!category) throw new NotFoundError('Category not found');
		}

		const resultado = [];
		const orderItems = await container.orderItemGateway.findAllByConsumerId(consumerId);
		let orderItemsWithDate = orderItems.map((orderItem) => {
			return { orderItem, date: orderItem.order.getOrderDate() };
		});
		// console.log(orderItemsWithDate);
		// filtrar pelas datas
		if (req.query.dataInicio && req.query.dataFim) {
			orderItemsWithDate = filterOrderItemsByDate(orderItemsWithDate, req.query.dataInicio, req.query.dataFim);
		}

		for (const oi of orderItemsWithDate) {
			const { orderItem } = oi;
			const enderecoProduto = orderItem.producerProduct.productionUnit.address;
			const enderecoConsumidor = orderItem.order.shippingAddress;
			const distancia = calcularDistancia(enderecoProduto, enderecoConsumidor);

			if (distancia <= Number(req.query.raio)) {
				if (category) {
					const categoryIds = orderItem.producerProduct.productSpec.categories.toArray().map((c) => c.category.id);
					const isCategoryPresent = categoryIds.includes(category.id);
					if (isCategoryPresent) {
						resultado.push({
							enderecoUnidadeProducao: enderecoProduto,
							enderecoConsumidor,
							distancia
						});
					}
				} else {
					resultado.push({
						enderecoUnidadeProducao: enderecoProduto,
						enderecoConsumidor,
						distancia
					});
				}
			}
		}
		// console.log(resultado.length);
		res.status(200).json(resultado);
	}

	@Get('/:consumerId/orders/report/evolution', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1)
			}),
			query: Joi.object({
				categoryId: Joi.number().integer().min(1).optional(),
				dataInicio: Joi.date().required(),
				dataFim: Joi.date().required(),
				raio: Joi.number().integer().min(1).required(),
				numeroEncomendas: Joi.boolean().optional(),
				totalProdutos: Joi.boolean().optional(),
				comprasTotais: Joi.boolean().optional(),
				numeroProdutosEncomendados: Joi.boolean().optional()
			}).xor('numeroEncomendas', 'totalProdutos', 'comprasTotais', 'numeroProdutosEncomendados')
		}),
		authenticationMiddleware
	])
	public async reportEvolution(@Response() res: Express.Response, @Params('consumerId') consumerId: number, @Request() req: Express.Request) {
		const consumer = await container.consumerGateway.findById(consumerId);
		if (!consumer) throw new NotFoundError('Consumer not found');

		let category = null;
		if (req.query.categoryId) {
			category = await container.categoryGateway.findById(Number(req.query.categoryId));
			if (!category) throw new NotFoundError('Category not found');
		}

		const orderItems = await container.orderItemGateway.findAllByConsumerId(consumerId);
		let orderItemsWithDate = orderItems.map((orderItem) => {
			return { orderItem, date: orderItem.order.getOrderDate() };
		});

		// filtrar pelas datas
		if (req.query.dataInicio && req.query.dataFim) {
			orderItemsWithDate = filterOrderItemsByDate(orderItemsWithDate, req.query.dataInicio, req.query.dataFim);
		}
		// console.log(orderItemsWithDate);
		const resultado = [];
		for (const oi of orderItemsWithDate) {
			const { orderItem } = oi;
			const enderecoProduto = orderItem.producerProduct.productionUnit.address;
			const enderecoConsumidor = orderItem.order.shippingAddress;
			const distancia = calcularDistancia(enderecoProduto, enderecoConsumidor);

			if (distancia <= Number(req.query.raio)) {
				if (category) {
					const categoryIds = orderItem.producerProduct.productSpec.categories.toArray().map((c) => c.category.id);
					const isCategoryPresent = categoryIds.includes(category.id);
					if (isCategoryPresent) {
						resultado.push(oi);
					}
				} else {
					resultado.push(oi);
				}
			}
		}

		// ver se há uma maneira melhor
		const opcao: string = Object.keys(req.query).filter((key) => req.query[key] === 'true')[0];
		const retorno = handleReportEvolution(resultado, opcao);

		res.status(200).json(retorno);
	}

	@Get('/:consumerId/orders/:orderId', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1),
				orderId: Joi.number().integer().min(1)
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.READ_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' orders", { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
		})
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
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' orders", { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
		})
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
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.READ_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' orders", { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
		})
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
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.READ_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' orders", { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
		})
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

	@Get('/:consumerId/orders/:orderId/items/:producerProductId/shipment', [
		validate({
			params: Joi.object({
				consumerId: Joi.number().integer().min(1),
				orderId: Joi.number().integer().min(1),
				producerProductId: Joi.number().integer().min(1)
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' orders", { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
		})
	])
	public async getOrderItemShipment(
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

		const shipment = await container.shipmentGateway.findByIdPopulated(item.shipment.id);

		for (const event of shipment!.events) {
			event.status = ShipmentStatus[event.status] as unknown as ShipmentStatus;
		}

		return res.status(200).json(shipment);
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
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.READ_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' addresses", { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
		})
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
		authenticationMiddleware,
		authorizationMiddleware({
			permissions: Permission.WRITE_OTHER_CONSUMER,
			otherValidations: [
				(user, req) =>
					user.id === Number(req.params.consumerId) ||
					throwError(
						new ForbiddenError("User may not interact with others' addresses", { user: user.id, consumer: Number(req.params.consumerId) })
					)
			]
		})
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
