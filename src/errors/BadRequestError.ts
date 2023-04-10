import { ApiError } from './ApiError';

export class BadRequestError extends ApiError {
	public constructor(message: string) {
		super(message, 400);
	}
}
