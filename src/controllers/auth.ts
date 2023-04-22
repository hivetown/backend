import { Injectable } from '@decorators/di';
import { Controller, Get, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { container } from '..';
import type { Consumer, Producer } from '../entities';
import { AuthMiddleware } from '../middlewares/auth';
import { NotFoundError } from '../errors/NotFoundError';

@Controller('/auth')
@Injectable()
export class AuthController {
	@Get('/', [AuthMiddleware])
	public async authUser(@Response() res: Express.Response, @Request() req: Express.Request) {
		let user: Consumer | Producer | null;

		// Fetch the user from the database
		user = await container.consumerGateway.findByAuthId(req.authUser!.uid);
		if (!user) user = await container.producerGateway.findByAuthId(req.authUser!.uid);

		if (!user) throw new NotFoundError('User not found');
		return res.status(200).json(user);
	}
}
