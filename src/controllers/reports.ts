import { Injectable } from '@decorators/di';
import { Controller, Get, Params, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { container } from '..';
import { authenticationMiddleware } from '../middlewares';
import { NotFoundError } from '../errors/NotFoundError';
import { UserType } from '../enums';
import { Joi, validate } from 'express-validation';
import { BadRequestError } from '../errors/BadRequestError';
import { convertEvolution, convertProducts, mergeResultsClients, mergeResultsEvolution, mergeResultsProducts } from '../utils/handleReport';

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

		const result = await container.orderGateway.getReportInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'flashcards',
			undefined,
			categoryId
		);

		const resultCancelados = await container.orderGateway.getReportCanceledInformation(
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
			totalProdutosCancelados: Number(resultCancelados.totalProdutosCancelados),
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

		const resultado = await container.orderGateway.getReportInformation(
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
				numeroProdutosEncomendados: Joi.boolean().optional()
			}).xor('numeroEncomendas', 'totalProdutos', 'comprasTotais', 'numeroProdutosEncomendados')
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

		const resultado = await container.orderGateway.getReportInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'evolution',
			opcao,
			category?.id
		);

		const resultadoCancelados = await container.orderGateway.getReportCanceledInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'evolution',
			opcao,
			category?.id
		);

		const result = convertEvolution(resultado, opcao);
		const resultCancelados = convertEvolution(resultadoCancelados, opcao);

		res.status(200).json(mergeResultsEvolution({ result, resultCancelados }, opcao, `${opcao}Cancelados`));
	}

	@Get('/admin/products', [
		validate({
			query: Joi.object({
				categoryId: Joi.number().integer().min(1).optional(),
				dataInicio: Joi.date().required(),
				dataFim: Joi.date().required(),
				raio: Joi.number().integer().min(1).required(),
				numeroEncomendas: Joi.boolean().optional(),
				totalProdutos: Joi.boolean().optional(),
				comprasTotais: Joi.boolean().optional()
			}).xor('numeroEncomendas', 'totalProdutos', 'comprasTotais')
		}),
		authenticationMiddleware
	])
	public async reportProductsAdmin(@Response() res: Express.Response, @Request() req: Express.Request) {
		let category = null;
		if (req.query.categoryId) {
			category = await container.categoryGateway.findById(Number(req.query.categoryId));
			if (!category) throw new NotFoundError('Category not found');
		}

		const opcao: string = Object.keys(req.query).filter((key) => req.query[key] === 'true')[0];

		const resultado = await container.orderGateway.getReportInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'products',
			opcao,
			category?.id
		);

		const resultadoCancelados = await container.orderGateway.getReportCanceledInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'products',
			opcao,
			category?.id
		);

		const result = convertProducts(resultado, opcao);
		const resultCancelados = convertProducts(resultadoCancelados, `${opcao}Cancelados`);
		// console.log(resultCancelados);
		const final = mergeResultsProducts(result, resultCancelados, opcao, `${opcao}Cancelados`);

		res.status(200).json(final);
	}

	@Get('/admin/clients', [
		validate({
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
	public async reportClientsAdmin(@Response() res: Express.Response, @Request() req: Express.Request) {
		let category = null;
		if (req.query.categoryId) {
			category = await container.categoryGateway.findById(Number(req.query.categoryId));
			if (!category) throw new NotFoundError('Category not found');
		}

		const opcao: string = Object.keys(req.query).filter((key) => req.query[key] === 'true')[0];

		const resultado = await container.orderGateway.getReportInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'clients',
			opcao,
			category?.id
		);

		const resultadoCancelados = await container.orderGateway.getReportCanceledInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'clients',
			opcao,
			category?.id
		);

		const r = mergeResultsClients(resultado, resultadoCancelados, opcao, `${opcao}Cancelados`);

		res.status(200).json(r);
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

		const resultado = await container.orderGateway.getReportInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'flashcards',
			undefined,
			category?.id,
			tipo === 'Consumer' ? user.id : undefined,
			tipo === 'Producer' ? user.id : undefined
		);
		const resultadoCancelados = await container.orderGateway.getReportCanceledInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'flashcards',
			undefined,
			category?.id,
			tipo === 'Consumer' ? user.id : undefined,
			tipo === 'Producer' ? user.id : undefined
		);

		res.status(200).json({
			numeroEncomendas: resultado.numeroEncomendas,
			numeroEncomendasCanceladas: resultadoCancelados.numeroEncomendasCanceladas,
			totalProdutos: resultado.totalProdutos,
			totalProdutosCancelados: Number(resultadoCancelados.totalProdutosCancelados),
			comprasTotais: resultado.comprasTotais,
			comprasTotaisCanceladas: resultadoCancelados.comprasTotaisCanceladas,
			numeroProdutosEncomendados: resultado.numeroProdutosEncomendados,
			numeroProdutosEncomendadosCancelados: resultadoCancelados.numeroProdutosEncomendadosCancelados
		});
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

		const resultado = await container.orderGateway.getReportInformation(
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
				numeroProdutosEncomendados: Joi.boolean().optional()
			}).xor('numeroEncomendas', 'totalProdutos', 'comprasTotais', 'numeroProdutosEncomendados')
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
		const resultado = await container.orderGateway.getReportInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'evolution',
			opcao,
			category?.id,
			tipo === 'Consumer' ? user.id : undefined,
			tipo === 'Producer' ? user.id : undefined
		);

		const resultadoCancelados = await container.orderGateway.getReportCanceledInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'evolution',
			opcao,
			category?.id,
			tipo === 'Consumer' ? user.id : undefined,
			tipo === 'Producer' ? user.id : undefined
		);

		const result = convertEvolution(resultado, opcao);
		const resultCancelados = convertEvolution(resultadoCancelados, opcao);

		res.status(200).json(mergeResultsEvolution({ result, resultCancelados }, opcao, `${opcao}Cancelados`));
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

		const opcao: string = Object.keys(req.query).filter((key) => req.query[key] === 'true')[0];

		const resultado = await container.orderGateway.getReportInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'products',
			opcao,
			category?.id,
			tipo === 'Consumer' ? user.id : undefined,
			tipo === 'Producer' ? user.id : undefined
		);

		const resultadoCancelados = await container.orderGateway.getReportCanceledInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'products',
			opcao,
			category?.id,
			tipo === 'Consumer' ? user.id : undefined,
			tipo === 'Producer' ? user.id : undefined
		);
		console.log(resultado);
		const result = convertProducts(resultado, opcao);
		console.log(result);
		const resultCancelados = convertProducts(resultadoCancelados, `${opcao}Cancelados`);
		const final = mergeResultsProducts(result, resultCancelados, opcao, `${opcao}Cancelados`);

		res.status(200).json(final);
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

		const opcao: string = Object.keys(req.query).filter((key) => req.query[key] === 'true')[0];

		const resultado = await container.orderGateway.getReportInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'clients',
			opcao,
			category?.id,
			undefined,
			user.id
		);

		const resultadoCancelados = await container.orderGateway.getReportCanceledInformation(
			String(req.query.dataInicio),
			String(req.query.dataFim),
			Number(req.query.raio),
			'clients',
			opcao,
			category?.id,
			undefined,
			user.id
		);

		const r = mergeResultsClients(resultado, resultadoCancelados, opcao, `${opcao}Cancelados`);

		res.status(200).json(r);
	}
}
