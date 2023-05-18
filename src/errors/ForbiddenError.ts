import { ApiError } from './ApiError';

export class ForbiddenError extends ApiError {
	public constructor(message: string, details?: Record<string, unknown>) {
		super(message, 403, details);
	}
}
