import { Injectable } from '@decorators/di';
import type { Middleware } from '@decorators/express';
import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { Authentication } from '../external/Authentication';

@Injectable()
export class AuthMiddleware implements Middleware {
	public async use(req: Request, _res: Response, next: NextFunction) {
		const { authorization } = req.headers;
		if (!authorization) {
			throw new UnauthorizedError('Authorization bearer is required but was not provided');
		}

		const [bearer, token] = authorization.split(' ');
		if (bearer !== 'Bearer') {
			throw new UnauthorizedError('Authorization type must be Bearer');
		}

		if (!token) {
			throw new UnauthorizedError('Authorization token is required but was not provided');
		}

		try {
			const user = await Authentication.getInstance().userFromIdToken(token);
			req.authUser = user;
		} catch (error) {
			throw new UnauthorizedError('Authorization token is invalid');
		}

		next();
	}
}
