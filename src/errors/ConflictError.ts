import { ApiError } from './ApiError';

export class ConflictError extends ApiError {
	public constructor(message: string) {
		super(message, 409);
	}
}
