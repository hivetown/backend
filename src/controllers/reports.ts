import { Injectable } from '@decorators/di';
import { Controller, Get, Params, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { container } from '..';
import { authenticationMiddleware } from '../middlewares';
import { NotFoundError } from '../errors/NotFoundError';
import { UserType } from '../enums';
import { Joi, validate } from 'express-validation';
import { filterOrderItemsByDate } from '../utils/filterReportDate';
import { calcularDistancia } from '../utils/calculateDistance';
// import { handleReportEvolution } from '../utils/handleReportEvolution';
import { handleReportProducts } from '../utils/handleReportProducts';
import { handleReportClients } from '../utils/handleReportClients';
import { BadRequestError } from '../errors/BadRequestError';
import { convertEvolution } from '../utils/convertEvolution';

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
		let categoryId: number | undefined;
		if (req.query.categoryId) {
			category = await container.categoryGateway.findById(Number(req.query.categoryId));
			if (!category) throw new NotFoundError('Category not found');
			categoryId = category.id;
		}

		const result = await container.orderGateway.getFlashCardsInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'flashcards',
			undefined,
			categoryId
		);

		const resultCancelados = await container.orderGateway.getFlashcardsCanceledInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'flashcards',
			undefined,
			categoryId
		);

		res.status(200).json({
			numeroEncomendas: result.numeroEncomendas,
			numeroEncomendasCanceladas: resultCancelados.numeroEncomendasCanceladas,
			totalProdutos: result.totalProdutos,
			totalProdutosCancelados: resultCancelados.totalProdutosCancelados,
			comprasTotais: result.comprasTotais,
			comprasTotaisCanceladas: resultCancelados.comprasTotaisCanceladas,
			numeroProdutosEncomendados: result.numeroProdutosEncomendados,
			numeroProdutosEncomendadosCancelados: resultCancelados.numeroProdutosEncomendadosCancelados
		});
	}

	@Get('/admin/map', [
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
	public async reportMapAdmin(@Response() res: Express.Response, @Request() req: Express.Request) {
		let category = null;
		if (req.query.categoryId) {
			category = await container.categoryGateway.findById(Number(req.query.categoryId));
			if (!category) throw new NotFoundError('Category not found');
		}

		const resultado = await container.orderGateway.getFlashCardsInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'map',
			undefined,
			category?.id
		);

		res.status(200).json(resultado);
	}

	@Get('/admin/evolution', [
		validate({
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
	public async reportEvolutionAdmin(@Response() res: Express.Response, @Request() req: Express.Request) {
		let category = null;
		if (req.query.categoryId) {
			category = await container.categoryGateway.findById(Number(req.query.categoryId));
			if (!category) throw new NotFoundError('Category not found');
		}

		const opcao: string = Object.keys(req.query).filter((key) => req.query[key] === 'true')[0];

		const resultado = await container.orderGateway.getFlashCardsInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'evolution',
			opcao,
			category?.id
		);

		const resultadoCancelados = await container.orderGateway.getFlashcardsCanceledInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'evolution',
			opcao,
			category?.id
		);

		const result = convertEvolution(resultado, opcao);
		const resultCancelados = convertEvolution(resultadoCancelados, opcao);

		res.status(200).json({ result, resultCancelados });
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

		const resultado = await container.orderGateway.getFlashCardsInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'flashcards',
			undefined,
			category?.id,
			tipo === 'Consumer' ? user.id : undefined,
			tipo === 'Producer' ? user.id : undefined
		);
		const resultadoCancelados = await container.orderGateway.getFlashcardsCanceledInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'flashcards',
			undefined,
			category?.id,
			tipo === 'Consumer' ? user.id : undefined,
			tipo === 'Producer' ? user.id : undefined
		);

		if (tipo === 'Consumer') {
			res.status(200).json({
				numeroEncomendas: resultado.numeroEncomendas,
				numeroEncomendasCanceladas: resultadoCancelados.numeroEncomendasCanceladas,
				totalProdutos: resultado.totalProdutos,
				totalProdutosCancelados: resultadoCancelados.totalProdutosCancelados,
				comprasTotais: resultado.comprasTotais,
				comprasTotaisCanceladas: resultadoCancelados.comprasTotaisCanceladas,
				numeroProdutosEncomendados: resultado.numeroProdutosEncomendados,
				numeroProdutosEncomendadosCancelados: resultadoCancelados.numeroProdutosEncomendadosCancelados
			});
		} else {
			res.status(200).json({
				numeroEncomendas: resultado.numeroEncomendas,
				numeroEncomendasCanceladas: resultadoCancelados.numeroEncomendasCanceladas,
				totalProdutos: resultado.totalProdutos,
				totalProdutosCancelados: resultadoCancelados.totalProdutosCancelados,
				vendasTotais: resultado.comprasTotais,
				vendasTotaisCanceladas: resultadoCancelados.comprasTotaisCanceladas,
				numeroProdutosEncomendados: resultado.numeroProdutosEncomendados,
				numeroProdutosEncomendadosCancelados: resultadoCancelados.numeroProdutosEncomendadosCancelados
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

		const resultado = await container.orderGateway.getFlashCardsInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'map',
			undefined,
			category?.id,
			tipo === 'Consumer' ? user.id : undefined,
			tipo === 'Producer' ? user.id : undefined
		);

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

		const opcao: string = Object.keys(req.query).filter((key) => req.query[key] === 'true')[0];
		const resultado = await container.orderGateway.getFlashCardsInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'evolution',
			opcao,
			category?.id,
			tipo === 'Consumer' ? user.id : undefined,
			tipo === 'Producer' ? user.id : undefined
		);

		const resultadoCancelados = await container.orderGateway.getFlashcardsCanceledInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'evolution',
			opcao,
			category?.id,
			tipo === 'Consumer' ? user.id : undefined,
			tipo === 'Producer' ? user.id : undefined
		);

		const result: { [key: string]: number } = {};
		let i = 0;
		if (opcao === 'numeroEncomendas' || opcao === 'numeroProdutosEncomendados') {
			i = 1;
		}

		for (const item of resultado) {
			const { mes_ano } = item;
			if (item.totalProdutos) {
				i = item.totalProdutos;
			} else if (item.comprasTotais) {
				i = item.comprasTotais;
			}
			if (result[mes_ano]) {
				result[mes_ano] += Number(i);
			} else {
				result[mes_ano] = Number(i);
			}
		}

		let sum = 0;
		for (const key in result) {
			if (result.hasOwnProperty(key)) {
				sum += result[key];
			}
		}
		console.log(sum);

		res.status(200).json({ result, resultadoCancelados });
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
}
