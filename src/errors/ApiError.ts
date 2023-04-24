export class ApiError extends Error {
	public constructor(message: string, public statusCode: number) {
		super(message);
	}
}
