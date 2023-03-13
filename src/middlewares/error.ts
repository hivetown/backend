import { Container, Injectable } from '@decorators/di';
import { ErrorMiddleware, ERROR_MIDDLEWARE } from '@decorators/express';
import type { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'express-validation';

@Injectable()
export class ServerErrorMiddleware implements ErrorMiddleware {
	public use(error: Error, _req: Request, res: Response, _next: NextFunction) {
		if (error instanceof ValidationError) {
			res.json({ error: error.error, statusCode: error.statusCode, details: error.details });
			return;
		}

		res.json({ error: 'Internal Server Error', statusCode: 500 });
	}
}

Container.provide([{ provide: ERROR_MIDDLEWARE, useClass: ServerErrorMiddleware }]);
