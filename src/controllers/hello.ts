import { Response, Controller, Get, Post, Request } from '@decorators/express';
import { Injectable } from '@decorators/di';
import * as Express from 'express';
import { Joi, validate } from 'express-validation';
import { container } from '..';
import { authorizationMiddleware } from '../middlewares';

// Create the controller
@Controller('/hello')
@Injectable()
export class HelloController {
	// Create a GET route
	@Get('/world', [authorizationMiddleware(1)])
	public index(@Response() res: Express.Response) {
		res.send('Hello World!');
	}

	// Create another GET route
	@Get('/json')
	public json(@Response() res: Express.Response) {
		res.json({ hello: 'world' });
	}

	// Demo of using domain package
	@Get('/domain')
	public async domain(@Response() res: Express.Response) {
		try {
			const producers = await container.producerGateway.findAll();

			res.json({ producers });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Post('/', [
		validate({
			body: Joi.object({
				name: Joi.string().required(),
				email: Joi.string().required()
			})
		})
	])
	public create(@Response() res: Express.Response, @Request() req: Express.Request) {
		return res.json({ body: req.body });
	}
}
