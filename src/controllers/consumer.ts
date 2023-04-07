import { Injectable } from '@decorators/di';
import { Controller, Delete, Get, Params, Post, Put, Request, Response } from '@decorators/express';
import { NotFoundError, UniqueConstraintViolationException } from '@mikro-orm/core';
import * as Express from 'express';
import { Joi, validate } from 'express-validation';
import { container } from '..';
import { Address, CartItem, Consumer, Order } from '../entities';
import { ShipmentStatus } from '../enums';
import { ApiError } from '../errors/ApiError';
import { ConflictError } from '../errors/ConflictError';
import { AuthMiddleware } from '../middlewares/auth';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
// import * as fs from 'fs';
import { convertExportOrderItem } from '../utils/convertExportOrderItem';
import type { ExportOrder } from '../interfaces/ExportOrder';
import type { ExportAddress } from '../interfaces/ExportAddress';
import { convertAddress } from '../utils/convertAdress';

@Controller('/consumers')
@Injectable()
export class ConsumerController {
	@Get('/', [AuthMiddleware])
	public async getConsumers(@Response() res: Express.Response): Promise<void> {
		const consumers = await container.consumerGateway.findAll();
		res.json(consumers);
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
	public async createConsumer(@Response() res: Express.Response, @Request() req: Express.Request): Promise<void> {
		try {
			const data: Consumer = req.body;
			data.authId = req.authUser!.uid;
			data.email = req.authUser!.email!;

			const consumer = await container.consumerGateway.create(data);
			res.status(201).json(consumer);
		} catch (error) {
			if (error instanceof UniqueConstraintViolationException) {
				throw new ConflictError('Consumer already exists');
			}

			throw new ApiError((error as any).message, 500);
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
		}),
		AuthMiddleware
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
		}),
		AuthMiddleware
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
		}),
		AuthMiddleware
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
				res.status(200).json({
					items: result,
					totalItems: orders.totalItems,
					totalPages: orders.totalPages,
					page: orders.page,
					pageSize: orders.pageSize
				});
			} else {
				res.status(404).json({ error: 'Consumer not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
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
	public async createOrder(
		@Response() res: Express.Response,
		@Request() req: Express.Request,
		@Params('consumerId') consumerId: number
	): Promise<void> {
		try {
			const consumer = await container.consumerGateway.findByIdWithCartAndProducts(consumerId);
			if (consumer) {
				const address = consumer.addresses.getItems().find((address) => address.id === req.body.shippingAddressId);
				if (address) {
					if (consumer.cartItems.getItems().length > 0) {
						const haveStock = consumer.existStockCartItems();
						if (haveStock) {
							for (const item of consumer.cartItems.getItems()) {
								item.producerProduct.stock -= item.quantity;
								await container.productGateway.updateProduct(item.producerProduct);
							}
							const newOrder = new Order().create(consumer, address); // para já apenas pego o primeiro endereço do consumidor A ALTERAR
							await container.orderGateway.createOrder(newOrder); // cria a order
							await container.consumerGateway.deleteCart(consumer); // limpa o carrinho
							res.status(200).json({ message: 'Order created and cart cleared' });
						} else {
							res.status(400).json({ error: 'Not enough stock ' }); // elaborar melhor esta mensagem para indicar o stock existente
						}
					} else {
						res.status(400).json({ error: 'Cart is empty' });
					}
				} else {
					res.status(404).json({ error: 'Address not found' });
				}
			} else {
				res.status(404).json({ error: 'Consumer not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
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
	public async exportOrders(
		@Response() res: Express.Response,
		@Request() req: Express.Request,
		@Params('consumerId') consumerId: number
	): Promise<void> {
		try {
			const consumer = await container.consumerGateway.findById(consumerId);
			if (consumer) {
				const orderIds = (req.query.id as string[]).map((id: string) => Number(id));
				const os = await container.orderGateway.findByIdsToExport(orderIds, consumerId);

				if (os.length > 0) {
					const results = new Array(os.length);

					for (let i = 0; i < os.length; i++) {
						const o = os[i];
						const newAddress: ExportAddress = convertAddress(o.shippingAddress);
						const newObj: ExportOrder = {
							id: o.id,
							shippingAddress: newAddress,
							generalStatus: o.getGeneralStatus(),
							totalPrice: o.getTotalPrice(),
							items: convertExportOrderItem(o.items)
						};
						results[i] = newObj;
						i++;
					}

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
		}),
		AuthMiddleware
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
		}),
		AuthMiddleware
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
					for (let i = 0; i < result.items.length; i++) {
						const item = result.items[i];
						const status = ShipmentStatus[item.shipment.getLastEvent().status];
						items[i] = { producerProduct: item.producerProduct, status, quantity: item.quantity, price: item.price };
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
		}),
		AuthMiddleware
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
	public async getAddresses(@Request() req: Express.Request, @Response() res: Express.Response): Promise<void> {
		const consumer = await container.consumerGateway.findByAuthId(req.authUser!.uid);

		if (!consumer) {
			throw new NotFoundError('Consumer not found');
		}

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		res.json(await container.addressGateway.findFromConsumer(consumer.id, options));
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
	public async addAddress(@Request() req: Express.Request, @Response() res: Express.Response): Promise<void> {
		const consumer = await container.consumerGateway.findByAuthId(req.authUser!.uid);

		if (!consumer) {
			throw new NotFoundError('Consumer not found');
		}

		const address: Address = req.body;
		address.consumer = consumer;

		try {
			const createdAddress = await container.addressGateway.create(address);
			res.status(201).json(createdAddress);
		} catch (error) {
			throw new ApiError((error as any).message, 500);
		}
	}
}
