import { Injectable } from '@decorators/di';
import { Controller, Get, Params, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { container } from '..';
import { authenticationMiddleware } from '../middlewares';
import { NotFoundError } from '../errors/NotFoundError';
import { ShipmentStatus, UserType } from '../enums';
import { Joi, validate } from 'express-validation';
import { filterOrderItemsByDate } from '../utils/filterReportDate';
import { calcularDistancia } from '../utils/calculateDistance';
import { handleReportEvolution } from '../utils/handleReportEvolution';
import { handleReportProducts } from '../utils/handleReportProducts';
import { handleReportClients } from '../utils/handleReportClients';
import { BadRequestError } from '../errors/BadRequestError';
import type { OrderItem } from '../entities';

@Controller('/reports')
@Injectable()
export class ReportsController {
	@Get('/admin/flashcards', [
		validate({
			query: Joi.object({
				categoryId: Joi.number().integer().min(1).optional(),
				dataInicio: Joi.date().required(),
				dataFim: Joi.date().required(),
				raio: Joi.number().integer().min(1).required()
			})
		}),
		authenticationMiddleware
	])
	public async reportFlashcardsAdmin(@Response() res: Express.Response, @Request() req: Express.Request) {
		let category = null;
		if (req.query.categoryId) {
			category = await container.categoryGateway.findById(Number(req.query.categoryId));
			if (!category) throw new NotFoundError('Category not found');
		}

		res.status(200).json({});
	}

	@Get('/:userId/flashcards', [
		validate({
			params: Joi.object({
				userId: Joi.number().integer().min(1)
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
	public async reportFlashcards(@Response() res: Express.Response, @Request() req: Express.Request, @Params('userId') consumerId: number) {
		const user = await container.userGateway.findById(consumerId);
		if (!user) throw new NotFoundError('User not found');

		const tipo = user.type === UserType.Consumer ? 'Consumer' : 'Producer';

		let category = null;
		if (req.query.categoryId) {
			category = await container.categoryGateway.findById(Number(req.query.categoryId));
			if (!category) throw new NotFoundError('Category not found');
		}

		const encomendas: number[] = [];
		let totalProdutos = 0;
		let valorTotal = 0; // vai ser ou compras totais ou vendas totais
		const produtosEncomendados = [];
		const encomendasCanceladas: number[] = [];
		let totalProdutosCancelados = 0;
		let valorTotalCancelado = 0;
		const produtosEncomendadosCancelados = [];

		let orderItems;
		if (tipo === 'Consumer') {
			orderItems = await container.orderItemGateway.findAllByConsumerId(consumerId);
		} else {
			orderItems = await container.orderItemGateway.findOrdersByProducerPopulated(consumerId);
		}

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
						encomendas.push(orderItem.order.id);
						totalProdutos += orderItem.quantity;
						valorTotal += orderItem.quantity * orderItem.price;
						produtosEncomendados.push(orderItem.producerProduct.id);
						if (orderItem.getActualStatus() === ShipmentStatus.Canceled) {
							encomendasCanceladas.push(orderItem.order.id);
							totalProdutosCancelados += orderItem.quantity;
							valorTotalCancelado += orderItem.quantity * orderItem.price;
							produtosEncomendadosCancelados.push(orderItem.producerProduct.id);
						}
					}
				} else {
					encomendas.push(orderItem.order.id);
					totalProdutos += orderItem.quantity;
					valorTotal += orderItem.quantity * orderItem.price;
					produtosEncomendados.push(orderItem.producerProduct.id);

					if (orderItem.getActualStatus() === ShipmentStatus.Canceled) {
						encomendasCanceladas.push(orderItem.order.id);
						totalProdutosCancelados += orderItem.quantity;
						valorTotalCancelado += orderItem.quantity * orderItem.price;
						produtosEncomendadosCancelados.push(orderItem.producerProduct.id);
					}
				}
			}
		}

		const numeroEncomendas = [...new Set(encomendas)].length;
		const numeroProdutosEncomendados = [...new Set(produtosEncomendados)].length;
		const numeroEncomendasCanceladas = [...new Set(encomendasCanceladas)].length;
		const numeroProdutosEncomendadosCancelados = [...new Set(produtosEncomendadosCancelados)].length;
		// console.log(encomendasCanceladas);

		if (tipo === 'Consumer') {
			res.status(200).json({
				numeroEncomendas,
				numeroEncomendasCanceladas,
				totalProdutos,
				totalProdutosCancelados,
				comprasTotais: valorTotal,
				comprasTotaisCanceladas: valorTotalCancelado,
				numeroProdutosEncomendados,
				numeroProdutosEncomendadosCancelados
			});
		} else {
			res.status(200).json({
				numeroEncomendas,
				numeroEncomendasCanceladas,
				totalProdutos,
				totalProdutosCancelados,
				vendasTotais: valorTotal,
				vendasTotaisCanceladas: valorTotalCancelado,
				numeroProdutosEncomendados,
				numeroProdutosEncomendadosCancelados
			});
		}
	}

	@Get('/:userId/map', [
		validate({
			params: Joi.object({
				userId: Joi.number().integer().min(1)
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
	public async reportMap(@Response() res: Express.Response, @Request() req: Express.Request, @Params('userId') userId: number) {
		const user = await container.userGateway.findById(userId);
		if (!user) throw new NotFoundError('User not found');

		const tipo = user.type === UserType.Consumer ? 'Consumer' : 'Producer';

		let category = null;
		if (req.query.categoryId) {
			category = await container.categoryGateway.findById(Number(req.query.categoryId));
			if (!category) throw new NotFoundError('Category not found');
		}

		const resultado = [];
		let orderItems = [];
		let orderItemsWithDate = [];
		if (tipo === 'Consumer') {
			orderItems = await container.orderItemGateway.findAllByConsumerId(userId);
			orderItemsWithDate = orderItems.map((orderItem) => {
				return { orderItem, date: orderItem.order.getOrderDate() };
			});
		} else {
			orderItems = await container.orderItemGateway.findOrdersByProducerPopulated(userId);
			orderItemsWithDate = orderItems.map((orderItem) => {
				return { orderItem, date: orderItem.getFirstDate() };
			});
		}

		if (req.query.dataInicio && req.query.dataFim) {
			orderItemsWithDate = filterOrderItemsByDate(orderItemsWithDate, req.query.dataInicio, req.query.dataFim);
		}

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
					const categoryIds = orderItem.producerProduct.productSpec.categories
						.toArray()
						.map((c: { category: { id: any } }) => c.category.id);
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

	@Get('/:userId/evolution', [
		validate({
			params: Joi.object({
				userId: Joi.number().integer().min(1)
			}),
			query: Joi.object({
				categoryId: Joi.number().integer().min(1).optional(),
				dataInicio: Joi.date().required(),
				dataFim: Joi.date().required(),
				raio: Joi.number().integer().min(1).required(),
				numeroEncomendas: Joi.boolean().optional(),
				totalProdutos: Joi.boolean().optional(),
				comprasTotais: Joi.boolean().optional(),
				vendasTotais: Joi.boolean().optional(),
				numeroProdutosEncomendados: Joi.boolean().optional()
			}).xor('numeroEncomendas', 'totalProdutos', 'comprasTotais', 'vendasTotais', 'numeroProdutosEncomendados')
		}),
		authenticationMiddleware
	])
	public async reportEvolution(@Response() res: Express.Response, @Request() req: Express.Request, @Params('userId') userId: number) {
		const user = await container.userGateway.findById(userId);
		if (!user) throw new NotFoundError('User not found');

		const tipo = user.type === UserType.Consumer ? 'Consumer' : 'Producer';

		let category = null;
		if (req.query.categoryId) {
			category = await container.categoryGateway.findById(Number(req.query.categoryId));
			if (!category) throw new NotFoundError('Category not found');
		}

		let orderItems = [];
		let orderItemsWithDate = [];
		if (tipo === 'Consumer') {
			orderItems = await container.orderItemGateway.findAllByConsumerId(userId);
			orderItemsWithDate = orderItems.map((orderItem) => {
				return { orderItem, date: orderItem.order.getOrderDate() };
			});
		} else {
			orderItems = await container.orderItemGateway.findOrdersByProducerPopulated(userId);
			orderItemsWithDate = orderItems.map((orderItem) => {
				return { orderItem, date: orderItem.getFirstDate() };
			});
		}

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
					const categoryIds = orderItem.producerProduct.productSpec.categories
						.toArray()
						.map((c: { category: { id: any } }) => c.category.id);
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

	@Get('/:userId/products', [
		validate({
			params: Joi.object({
				userId: Joi.number().integer().min(1)
			}),
			query: Joi.object({
				categoryId: Joi.number().integer().min(1).optional(),
				dataInicio: Joi.date().required(),
				dataFim: Joi.date().required(),
				raio: Joi.number().integer().min(1).required(),
				numeroEncomendas: Joi.boolean().optional(),
				totalProdutos: Joi.boolean().optional(),
				comprasTotais: Joi.boolean().optional(),
				vendasTotais: Joi.boolean().optional(),
				numeroProdutosEncomendados: Joi.boolean().optional()
			}).xor('numeroEncomendas', 'totalProdutos', 'comprasTotais', 'vendasTotais', 'numeroProdutosEncomendados')
		}),
		authenticationMiddleware
	])
	public async reportProducts(@Response() res: Express.Response, @Request() req: Express.Request, @Params('userId') userId: number) {
		const user = await container.userGateway.findById(userId);
		if (!user) throw new NotFoundError('User not found');

		const tipo = user.type === UserType.Consumer ? 'Consumer' : 'Producer';

		let category = null;
		if (req.query.categoryId) {
			category = await container.categoryGateway.findById(Number(req.query.categoryId));
			if (!category) throw new NotFoundError('Category not found');
		}

		let orderItems = [];
		let orderItemsWithDate = [];
		if (tipo === 'Consumer') {
			orderItems = await container.orderItemGateway.findAllByConsumerId(userId);
			orderItemsWithDate = orderItems.map((orderItem) => {
				return { orderItem, date: orderItem.order.getOrderDate() };
			});
		} else {
			orderItems = await container.orderItemGateway.findOrdersByProducerPopulated(userId);
			orderItemsWithDate = orderItems.map((orderItem) => {
				return { orderItem, date: orderItem.getFirstDate() };
			});
		}

		if (req.query.dataInicio && req.query.dataFim) {
			orderItemsWithDate = filterOrderItemsByDate(orderItemsWithDate, req.query.dataInicio, req.query.dataFim);
		}

		const opcao: string = Object.keys(req.query).filter((key) => req.query[key] === 'true')[0];

		let resultado = [];

		for (const oi of orderItemsWithDate) {
			const { orderItem } = oi;
			const enderecoProduto = orderItem.producerProduct.productionUnit.address;
			const enderecoConsumidor = orderItem.order.shippingAddress;
			const distancia = calcularDistancia(enderecoProduto, enderecoConsumidor);

			if (distancia <= Number(req.query.raio)) {
				if (category) {
					const categoryIds = orderItem.producerProduct.productSpec.categories
						.toArray()
						.map((c: { category: { id: any } }) => c.category.id);
					const isCategoryPresent = categoryIds.includes(category.id);
					if (isCategoryPresent) {
						resultado = handleReportProducts(resultado, orderItem, opcao);
					}
				} else {
					resultado = handleReportProducts(resultado, orderItem, opcao);
				}
			}
		}

		res.status(200).json(resultado);
	}

	@Get('/:userId/clients', [
		validate({
			params: Joi.object({
				userId: Joi.number().integer().min(1)
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
	public async reportClients(@Response() res: Express.Response, @Request() req: Express.Request, @Params('userId') userId: number) {
		const user = await container.userGateway.findById(userId);
		if (!user) throw new NotFoundError('Producer not found');

		if (user.type !== UserType.Producer) throw new BadRequestError('User is not a producer');

		let category = null;
		if (req.query.categoryId) {
			category = await container.categoryGateway.findById(Number(req.query.categoryId));
			if (!category) throw new NotFoundError('Category not found');
		}

		const orderItems = await container.orderItemGateway.findOrdersByProducerPopulated(user.id);
		let orderItemsWithDate = orderItems.map((orderItem) => {
			return { orderItem, date: orderItem.getFirstDate() };
		});

		if (req.query.dataInicio && req.query.dataFim) {
			orderItemsWithDate = filterOrderItemsByDate(orderItemsWithDate, req.query.dataInicio, req.query.dataFim);
		}

		const opcao: string = Object.keys(req.query).filter((key) => req.query[key] === 'true')[0];

		let resultado: any[] = [];

		for (const oi of orderItemsWithDate) {
			// console.log(oi.orderItem.order.consumer);
			const { orderItem } = oi;
			const enderecoProduto = orderItem.producerProduct.productionUnit.address;
			const enderecoConsumidor = orderItem.order.shippingAddress;
			const distancia = calcularDistancia(enderecoProduto, enderecoConsumidor);

			if (distancia <= Number(req.query.raio)) {
				if (category) {
					const categoryIds = orderItem.producerProduct.productSpec.categories.toArray().map((c) => c.category.id);
					const isCategoryPresent = categoryIds.includes(category.id);
					if (isCategoryPresent) {
						resultado = handleReportClients(resultado, orderItem, opcao);
					}
				} else {
					resultado = handleReportClients(resultado, orderItem, opcao);
				}
			}
		}

		res.status(200).json(resultado);
	}

	@Get('/:userId/test', [
		validate({
			params: Joi.object({
				userId: Joi.number().integer().min(1)
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
	public async reportTest(@Response() res: Express.Response, @Request() req: Express.Request, @Params('userId') userId: number) {
		const user = await container.userGateway.findById(userId);
		if (!user) throw new NotFoundError('User not found');

		const tipo = user.type === UserType.Consumer ? 'Consumer' : 'Producer';

		let category = null;
		if (req.query.categoryId) {
			category = await container.categoryGateway.findById(Number(req.query.categoryId));
			if (!category) throw new NotFoundError('Category not found');
		}

		let orderItems: OrderItem[];
		if (tipo === 'Consumer') {
			if (req.query.categoryId) {
				orderItems = await container.orderItemGateway.findAllByConsumerIdNovoCategory(
					userId,
					Number(req.query.raio),
					Number(req.query.categoryId)
				);
			} else {
				orderItems = await container.orderItemGateway.findAllByConsumerIdNovo(userId, Number(req.query.raio));
			}
		} else if (req.query.categoryId) {
			orderItems = await container.orderItemGateway.findAllByProducerIdCategory(userId, Number(req.query.raio), Number(req.query.categoryId));
		} else {
			orderItems = await container.orderItemGateway.findAllByProducerId(userId, Number(req.query.raio));
		}

		let orderItemsWithDate = orderItems.map((orderItem) => {
			return { orderItem, date: orderItem.getFirstDate() };
		});

		if (req.query.dataInicio && req.query.dataFim) {
			orderItemsWithDate = filterOrderItemsByDate(orderItemsWithDate, req.query.dataInicio, req.query.dataFim);
		}

		const encomendas: number[] = [];
		let totalProdutos = 0;
		let valorTotal = 0; // vai ser ou compras totais ou vendas totais
		const produtosEncomendados = [];
		const encomendasCanceladas: number[] = [];
		let totalProdutosCancelados = 0;
		let valorTotalCancelado = 0;
		const produtosEncomendadosCancelados = [];

		for (const oi of orderItemsWithDate) {
			const { orderItem } = oi;
			encomendas.push(orderItem.order.id);
			totalProdutos += orderItem.quantity;
			valorTotal += orderItem.quantity * orderItem.price;
			produtosEncomendados.push(orderItem.producerProduct.id);

			if (orderItem.getActualStatus() === ShipmentStatus.Canceled) {
				encomendasCanceladas.push(orderItem.order.id);
				totalProdutosCancelados += orderItem.quantity;
				valorTotalCancelado += orderItem.quantity * orderItem.price;
				produtosEncomendadosCancelados.push(orderItem.producerProduct.id);
			}
		}

		const numeroEncomendas = [...new Set(encomendas)].length;
		const numeroProdutosEncomendados = [...new Set(produtosEncomendados)].length;
		const numeroEncomendasCanceladas = [...new Set(encomendasCanceladas)].length;
		const numeroProdutosEncomendadosCancelados = [...new Set(produtosEncomendadosCancelados)].length;

		if (tipo === 'Consumer') {
			res.status(200).json({
				numeroEncomendas,
				numeroEncomendasCanceladas,
				totalProdutos,
				totalProdutosCancelados,
				comprasTotais: valorTotal,
				comprasTotaisCanceladas: valorTotalCancelado,
				numeroProdutosEncomendados,
				numeroProdutosEncomendadosCancelados
			});
		} else {
			res.status(200).json({
				numeroEncomendas,
				numeroEncomendasCanceladas,
				totalProdutos,
				totalProdutosCancelados,
				vendasTotais: valorTotal,
				vendasTotaisCanceladas: valorTotalCancelado,
				numeroProdutosEncomendados,
				numeroProdutosEncomendadosCancelados
			});
		}
	}
}
