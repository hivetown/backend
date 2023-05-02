export class ApiError extends Error {
	public constructor(message: string, public statusCode: number, public details?: Record<string, unknown>) {
		super(message);
	}
}
