import { Injectable } from '@decorators/di';
import { Controller, Get, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { container } from '..';
import { AuthMiddleware } from '../middlewares/auth';
import { NotFoundError } from '../errors/NotFoundError';
import { UserType } from '../enums';

@Controller('/auth')
@Injectable()
export class AuthController {
	@Get('/', [AuthMiddleware])
	public async authUser(@Response() res: Express.Response, @Request() req: Express.Request) {
		// Fetch the user from the database
		const user = await container.userGateway.findByAuthId(req.authUser!.uid);
		if (!user) throw new NotFoundError('User not found');

		const consumerProducer =
			user.type === UserType.Consumer ? await container.consumerGateway.findById(user.id) : await container.producerGateway.findById(user.id);

		if (!consumerProducer) throw new NotFoundError(`${user.type} not found`);

		return res.status(200).json(consumerProducer);
	}
}
