import { Injectable } from '@decorators/di';
import { Controller, Get, Response } from '@decorators/express';
import * as Express from 'express';
import { container } from '..';
import { Consumer } from '../entities';

@Controller('/consumers')
@Injectable()
export class ConsumerController {
	@Get('/')
	public async getConsumers(@Response() res: Express.Response): Promise<void> {
		const consumers = await container.em.find(Consumer, {});
		res.json(consumers);
	}
}
