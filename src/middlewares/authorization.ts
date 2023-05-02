import { Injectable } from '@decorators/di';
import type { Middleware } from '@decorators/express';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthorizationMiddleware implements Middleware {
	public async use(req: Request, _res: Response, next: NextFunction) {
		await console.log();
		next();
	}
}
