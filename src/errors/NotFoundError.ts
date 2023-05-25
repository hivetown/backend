import { ApiError } from './ApiError';

export class NotFoundError extends ApiError {
	public constructor(message: string) {
		super(message, 404);
	}
}
