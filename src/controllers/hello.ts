import { Response, Controller, Get } from '@decorators/express';
import { Injectable } from '@decorators/di';
import * as Express from 'express';
import { container } from '..';

// Create the controller
@Controller('/hello')
@Injectable()
export class HelloController {
	// Create a GET route
	@Get('world')
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
}
