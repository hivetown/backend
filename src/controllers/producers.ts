import { Injectable } from '@decorators/di';
import * as Express from 'express';
import { Joi, validate } from 'express-validation';
import { container } from '..';
import type { ProducerProductOptions } from '../interfaces/ProducerProductOptions';
import { Controller, Delete, Get, Params, Post, Put, Request, Response } from '@decorators/express';
import { Producer, ProducerProduct, ProductionUnit, ShipmentEvent, ShipmentStatus, User } from '../entities';
import { authenticationMiddleware, authorizationMiddleware } from '../middlewares';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { CarrierStatus, UserType } from '../enums';
import { BadRequestError } from '../errors/BadRequestError';
import { Permission } from '../enums/Permission';
import { throwError } from '../utils/throw';
import { ForbiddenError } from '../errors/ForbiddenError';
import { Authentication } from '../external/Authentication';
import { hasPermissions } from '../utils/hasPermission';
import { filterOrderItemsByDate } from '../utils/filterReportDate';
import { calcularDistancia } from '../utils/calculateDistance';
import { handleReportEvolution } from '../utils/handleReportEvolution';

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
			const user = await container.producerGateway.create({ user: data } as Producer);
			return res.status(201).json(user);
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
		authenticationMiddleware
	])
	public async getProducers(@Response() res: Express.Response, @Request() req: Express.Request) {
		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};
		let producers;
		if (req.query.includeAll && hasPermissions(req.user!, Permission.READ_OTHER_PRODUCER)) {
			producers = await container.producerGateway.findAllWithDeletedAt(options);
		} else {
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
				phone: Joi.string().required()
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
		if (req.query.includeAll && hasPermissions(req.user!, Permission.READ_OTHER_CONSUMER)) {
			producer = await container.producerGateway.findByIdWithDeletedAt(producerId);
		} else {
			producer = await container.producerGateway.findById(producerId);
		}

		if (!producer) throw new NotFoundError('Producer not found');

		producer.user.name = req.body.name;
		producer.user.email = req.body.email;
		producer.user.phone = req.body.phone;

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
		authenticationMiddleware
	])
	public async getProducer(@Response() res: Express.Response, @Params('producerId') producerId: number, @Request() req: Express.Request) {
		let producer;
		if (req.query.includeAll && hasPermissions(req.user!, Permission.READ_OTHER_CONSUMER)) {
			producer = await container.producerGateway.findByIdWithDeletedAt(producerId);
		} else {
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

		res.status(201).json(producer);
	}

	@Get('/:producerId/products', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required()
			})
		})
	])
	public async producerProducts(@Response() res: Express.Response, @Request() req: Express.Request, @Params('producerId') producerId: number) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const options: ProducerProductOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1,
			populate: ['producerProduct.productSpec', 'producerProduct.productionUnit', 'producerProduct_productSpec.images']
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
		return res.status(200).json(orders);
	}

	@Get('/:producerId/orders/report/flashcards', [
		validate({
			params: Joi.object({
				producerId: Joi.number().min(1).required()
			}),
			query: Joi.object({
				categoryId: Joi.number().min(1).optional(),
				dataInicio: Joi.date().required(),
				dataFim: Joi.date().required(),
				raio: Joi.number().min(1).required()
			})
		}),
		authenticationMiddleware
	])
	public async reportFlashcards(@Response() res: Express.Response, @Request() req: Express.Request, @Params('producerId') producerId: number) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		let category = null;
		if (req.query.categoryId) {
			category = await container.categoryGateway.findById(Number(req.query.categoryId));
			if (!category) throw new NotFoundError('Category not found');
		}

		const encomendas: number[] = [];
		let totalProdutos = 0;
		let comprasTotais = 0;
		const produtosEncomendados = [];

		const orderItems = await container.orderItemGateway.findOrdersByProducerPopulated(producerId);
		// console.log(orderItems.length);
		let orderItemsWithDate = orderItems.map((orderItem) => {
			// console.log(orderItem.order.id, orderItem.producerProduct.id);
			return { orderItem, date: orderItem.getFirstDate() };
		});
		// console.log(orderItemsWithDate);
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
						produtosEncomendados.push(orderItem);
					}
				} else {
					encomendas.push(orderItem.order.id);
					totalProdutos += orderItem.quantity;
					comprasTotais += orderItem.quantity * orderItem.price;
					produtosEncomendados.push(orderItem);
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

	@Get('/:producerId/orders/report/map', [
		validate({
			params: Joi.object({
				producerId: Joi.number().integer().min(1)
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
	public async reportMap(@Response() res: Express.Response, @Request() req: Express.Request, @Params('producerId') producerId: number) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		let category = null;
		if (req.query.categoryId) {
			category = await container.categoryGateway.findById(Number(req.query.categoryId));
			if (!category) throw new NotFoundError('Category not found');
		}

		const resultado = [];
		const orderItems = await container.orderItemGateway.findOrdersByProducerPopulated(producerId);
		let orderItemsWithDate = orderItems.map((orderItem) => {
			return { orderItem, date: orderItem.getFirstDate() };
		});

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

		res.status(200).json(resultado);
	}

	@Get('/:producerId/orders/report/evolution', [
		validate({
			params: Joi.object({
				producerId: Joi.number().integer().min(1)
			}),
			query: Joi.object({
				categoryId: Joi.number().integer().min(1).optional(),
				dataInicio: Joi.date().required(),
				dataFim: Joi.date().required(),
				raio: Joi.number().integer().min(1).required(),
				numeroEncomendas: Joi.boolean().optional(),
				totalProdutos: Joi.boolean().optional(),
				vendasTotais: Joi.boolean().optional(),
				numeroProdutosEncomendados: Joi.boolean().optional()
			}).xor('numeroEncomendas', 'totalProdutos', 'vendasTotais', 'numeroProdutosEncomendados')
		}),
		authenticationMiddleware
	])
	public async reportEvolution(@Response() res: Express.Response, @Request() req: Express.Request, @Params('producerId') producerId: number) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		let category = null;
		if (req.query.categoryId) {
			category = await container.categoryGateway.findById(Number(req.query.categoryId));
			if (!category) throw new NotFoundError('Category not found');
		}

		const orderItems = await container.orderItemGateway.findOrdersByProducerPopulated(producerId);
		let orderItemsWithDate = orderItems.map((orderItem) => {
			return { orderItem, date: orderItem.getFirstDate() };
		});

		if (req.query.dataInicio && req.query.dataFim) {
			orderItemsWithDate = filterOrderItemsByDate(orderItemsWithDate, req.query.dataInicio, req.query.dataFim);
		}

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

		const opcao: string = Object.keys(req.query).filter((key) => req.query[key] === 'true')[0];
		const retorno = handleReportEvolution(resultado, opcao);

		res.status(200).json(retorno);
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

		return res.status(201).json(orderItem.shipment);
	}

	@Get('/:producerId/units', [
		validate({
			params: Joi.object({ producerId: Joi.number().required() })
		})
	])
	public async getUnits(@Request() req: Express.Request, @Response() res: Express.Response, @Params('producerId') producerId: number) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const units = await container.productionUnitGateway.findFromProducer(producer.user.id, options);
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

	@Get('/:producerId/units/:unitId/carriers/inTransit', [
		validate({
			params: Joi.object({
				producerId: Joi.number().required(),
				unitId: Joi.number().required()
			}),
			query: Joi.object({
				page: Joi.number().optional(),
				pageSize: Joi.number().optional()
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
	public async getProductionUnitCarriersInTransitOfProductionUnit(
		@Response() res: Express.Response,
		@Request() req: Express.Request,
		@Params('producerId') producerId: number,
		@Params('unitId') unitId: number
	) {
		const producer = await container.producerGateway.findById(producerId);
		if (!producer) throw new NotFoundError('Producer not found');

		const productionUnit = await container.productionUnitGateway.findById(unitId);
		if (!productionUnit || productionUnit.producer.user.id !== producer.user.id) throw new NotFoundError('Production unit not found');

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const carriers = await container.carrierGateway.findAllinTranstit(productionUnit.id, options);

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
}
