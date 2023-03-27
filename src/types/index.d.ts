import type { AuthenticationUser } from '../interfaces/AuthenticationUser';

declare module 'express-serve-static-core' {
	interface Request {
		/**
		 * The authenticated user, if any
		 */
		authUser: AuthenticationUser | null;
	}
}
