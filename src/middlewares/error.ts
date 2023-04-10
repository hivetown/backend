import { Container, Injectable } from '@decorators/di';
import { ErrorMiddleware, ERROR_MIDDLEWARE } from '@decorators/express';
import type { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'express-validation';
import { ApiError } from '../errors/ApiError';

@Injectable()
export class ServerErrorMiddleware implements ErrorMiddleware {
	public use(error: Error, _req: Request, res: Response, _next: NextFunction) {
		if (error instanceof ValidationError) {
			return res.status(error.statusCode).json({ error: error.error, statusCode: error.statusCode, details: error.details });
		}

		if (error instanceof ApiError) {
			// TODO add details?
			return res.status(error.statusCode).json({ error: error.message, statusCode: error.statusCode });
		}

		console.log(error);
		return res.status(500).json({ error: 'Internal Server Error', statusCode: 500 });
	}
}

Container.provide([{ provide: ERROR_MIDDLEWARE, useClass: ServerErrorMiddleware }]);
