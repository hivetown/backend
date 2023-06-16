import { Injectable } from '@decorators/di';
import { Controller, Get, Response } from '@decorators/express';
import * as Express from 'express';

@Controller('/healthz')
@Injectable()
export class HealthController {
	@Get('/')
	public getHealth(@Response() res: Express.Response) {
		return res.status(200).send('OK');
	}

	@Get('/jpp')
	public getJpp(@Response() res: Express.Response) {
		return res.status(200).sendFile('umvoltoja.mp3', { root: `${__dirname}/../../public` });
	}
}
