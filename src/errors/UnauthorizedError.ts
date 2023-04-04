import { ApiError } from './ApiError';

export class UnauthorizedError extends ApiError {
	public constructor(message: string) {
		super(message, 401);
	}
}
