import { Injectable } from '@decorators/di';
import { Controller, Post, Request, Response } from '@decorators/express';
import { Joi, validate } from 'express-validation';
import * as Express from 'express';
import type { Producer } from '../entities';
import { AuthMiddleware } from '../middlewares/auth';
import { container } from '..';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { ConflictError } from '../errors/ConflictError';
import { ApiError } from '../errors/ApiError';

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
}
