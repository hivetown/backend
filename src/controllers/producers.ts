import { Injectable } from '@decorators/di';
import { Controller, Get, Params, Post, Request, Response } from '@decorators/express';
import { Joi, validate } from 'express-validation';
import * as Express from 'express';
import type { Producer } from '../entities';
import { AuthMiddleware } from '../middlewares/auth';
import { container } from '..';
import { NotFoundError, UniqueConstraintViolationException } from '@mikro-orm/core';
import { ConflictError } from '../errors/ConflictError';
import { ApiError } from '../errors/ApiError';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';

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
	public async createProducer(@Response() res: Express.Response, @Request() req: Express.Request): Promise<void> {
		try {
			const data: Producer = req.body;
			data.authId = req.authUser!.uid;
			data.email = req.authUser!.email!;

			const producer = await container.producerGateway.create(data);
			res.status(201).json(producer);
		} catch (error) {
			if (error instanceof UniqueConstraintViolationException) {
				throw new ConflictError('Producer already exists');
			}

			throw new ApiError((error as any).message, 500);
		}
	}

	@Get('/:producerId/units', [
		validate({
			params: Joi.object({ producerId: Joi.number().required() }),
			query: Joi.object({
				page: Joi.number().min(1),
				pageSize: Joi.number().min(1)
			})
		})
	])
	public async getUnits(
		@Request() req: Express.Request,
		@Response() res: Express.Response,
		@Params('producerId') producerId: number
	): Promise<void> {
		try {
			const producer = await container.producerGateway.findById(producerId);

			if (!producer) {
				throw new NotFoundError('Producer not found');
			}

			const options: PaginatedOptions = {
				page: Number(req.query.page) || -1,
				size: Number(req.query.pageSize) || -1
			};

			res.json(await container.productionUnitGateway.findFromProducer(producer.id, options));
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}
}
