import { Injectable } from '@decorators/di';
import { Controller, Delete, Get, Params, Post, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { container } from '..';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { authenticationMiddleware } from '../middlewares';
import { Joi, validate } from 'express-validation';
import { NotFoundError } from '../errors/NotFoundError';
import type { NotificationFilter } from '../interfaces/NotificationFilter';
import { BadRequestError } from '../errors/BadRequestError';
import { Permission } from '../enums/Permission';
import { ForbiddenError } from '../errors/ForbiddenError';
import { hasPermissions } from '../utils/hasPermission';

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

	@Get('/:notificationid', [
		validate({
			params: Joi.object({
				notificationid: Joi.number().min(1).required()
			})
		}),
		authenticationMiddleware
	])
	public async notification(@Response() res: Express.Response, @Request() req: Express.Request, @Params('notificationid') notificationid: number) {
		const user = await container.userGateway.findByAuthId(req.authUser!.uid);
		if (!user) throw new NotFoundError('User not found');

		const notification = await container.notificationGateway.findById(notificationid);
		if (!notification) throw new NotFoundError('Notification not found');

		if (notification.notifier.id !== user.id && !hasPermissions(user, Permission.READ_OTHER_NOTIFICATION))
			throw new ForbiddenError('You are not allowed to access this notification');

		return res.status(200).json(notification);
	}

	@Delete('/:notificationid', [
		validate({
			params: Joi.object({
				notificationid: Joi.number().min(1).required()
			})
		}),
		authenticationMiddleware
	])
	public async deleteNotification(
		@Response() res: Express.Response,
		@Request() req: Express.Request,
		@Params('notificationid') notificationid: number
	) {
		const user = await container.userGateway.findByAuthId(req.authUser!.uid);
		if (!user) throw new NotFoundError('User not found');

		const notification = await container.notificationGateway.findById(notificationid);
		if (!notification) throw new NotFoundError('Notification not found');

		if (notification.notifier.id !== user.id && !hasPermissions(user, Permission.DELETE_OTHER_NOTIFICATION))
			throw new ForbiddenError('You are not allowed to access this notification');

		await container.notificationGateway.delete(notification);

		return res.status(204).send();
	}

	@Post('/:notificationid/read', [
		validate({
			params: Joi.object({
				notificationid: Joi.number().min(1).required()
			})
		}),
		authenticationMiddleware
	])
	public async readNotification(
		@Response() res: Express.Response,
		@Request() req: Express.Request,
		@Params('notificationid') notificationid: number
	) {
		const user = await container.userGateway.findByAuthId(req.authUser!.uid);
		if (!user) throw new NotFoundError('User not found');

		const notification = await container.notificationGateway.findById(notificationid);
		if (!notification) throw new NotFoundError('Notification not found');

		if (notification.notifier.id !== user.id && !hasPermissions(user, Permission.WRITE_OTHER_NOTIFICATION))
			throw new ForbiddenError('You are not allowed to access this notification');

		// If the notification is already read, we don't need to update it
		if (notification.readAt) return res.status(204).send();

		notification.readAt = new Date();
		await container.notificationGateway.update(notification);

		return res.status(201).json(notification);
	}

	@Post('/:notificationid/unread', [
		validate({
			params: Joi.object({
				notificationid: Joi.number().min(1).required()
			})
		}),
		authenticationMiddleware
	])
	public async unreadNotification(
		@Response() res: Express.Response,
		@Request() req: Express.Request,
		@Params('notificationid') notificationid: number
	) {
		const user = await container.userGateway.findByAuthId(req.authUser!.uid);
		if (!user) throw new NotFoundError('User not found');

		const notification = await container.notificationGateway.findById(notificationid);
		if (!notification) throw new NotFoundError('Notification not found');

		if (notification.notifier.id !== user.id && !hasPermissions(user, Permission.WRITE_OTHER_NOTIFICATION))
			throw new ForbiddenError('You are not allowed to access this notification');

		// If the notification is already unread, we don't need to update it
		if (!notification.readAt) return res.status(204).send();

		// Typescript WANTS undefined, but if we set it to undefined, it will disappear from response
		notification.readAt = null as unknown as undefined;
		await container.notificationGateway.update(notification);

		return res.status(201).json(notification);
	}
}
