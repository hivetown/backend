import { Injectable } from '@decorators/di';
import { Controller, Get, Response } from '@decorators/express';
import * as Express from 'express';
import { container } from '..';
import { Consumer } from '../entities';

@Controller('/consumers')
@Injectable()
export class ConsumerController {
	@Get('/')
	public async createConsumer(@Response() res: Express.Response) {
		try {
			await container.em.upsert(Consumer, {
				id: 1,
				email: 'teste',
				name: 'ola',
				phone: 123,
				vat: 123
			});

			const consumer = await container.em.findOne(Consumer, 1, { populate: true });

			res.json(consumer);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}
}
