import type { User } from '../entities';
import type { AuthenticationUser } from '../interfaces/AuthenticationUser';

declare module 'express-serve-static-core' {
	interface Request {
		/**
		 * The firebase authenticated user, if any
		 */
		authUser: AuthenticationUser | null;
		/**
		 * The authenticated user, if any
		 */
		user: User | null;
	}
}
