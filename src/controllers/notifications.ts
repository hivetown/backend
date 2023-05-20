import { Injectable } from '@decorators/di';
import { Controller, Get, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { container } from '..';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { authenticationMiddleware } from '../middlewares';
import { Joi, validate } from 'express-validation';
import { NotFoundError } from '../errors/NotFoundError';
import type { NotificationFilter } from '../interfaces/NotificationFilter';
import { BadRequestError } from '../errors/BadRequestError';

@Controller('/notifications')
@Injectable()
export class NotificationController {
	@Get('/', [
		validate({
			query: Joi.object({
				page: Joi.number().min(1).optional(),
				pageSize: Joi.number().min(1).optional(),
				unreadOnly: Joi.boolean().optional(),
				after: Joi.date().optional(),
				before: Joi.date().optional()
			})
		}),
		authenticationMiddleware
	])
	public async notifications(@Response() res: Express.Response, @Request() req: Express.Request) {
		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const user = await container.userGateway.findByAuthId(req.authUser!.uid);
		if (!user) throw new NotFoundError('User not found');

		const filter: NotificationFilter = {
			notifierId: user.id,
			unreadOnly: req.query.unreadOnly === 'true',
			before: req.query.before ? new Date(req.query.before as string) : undefined
		};

		if (req.query.after) filter.after = new Date(req.query.after as string);

		if (req.query.before) {
			filter.before = new Date(req.query.before as string);

			if (filter.after && filter.after > filter.before) {
				throw new BadRequestError('The after date must be before the before date');
			}
		}

		const data = await container.notificationGateway.findAll(filter, options);

		return res.status(200).json(data);
	}
}
