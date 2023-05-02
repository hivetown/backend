import type { NextFunction, Request, Response } from 'express';
import { container } from '..';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import type { User } from '../entities';
import { ForbiddenError } from '../errors/ForbiddenError';

/**
 * A generic validation function for the authorization middleware
 * @param user The user to validate
 * @throws ForbiddenError if the user is not valid
 * @returns void
 */
type AuthorizationValidation = (user: User) => void;

export const authorizationMiddleware = ({
	permissions,
	otherValidations
}: {
	permissions?: number;
	otherValidations?: AuthorizationValidation[];
}) => {
	return async (req: Request, _res: Response, next: NextFunction) => {
		if (!req.authUser) throw new UnauthorizedError('User is not authenticated');

		const user = await container.userGateway.findByAuthId(req.authUser.uid, { populate: ['role'] });
		if (!user) throw new UnauthorizedError('User is not authenticated');

		// Bitwise AND operator to check if the user has the required permission(s)
		if (permissions) {
			const hasBasePermission = (user.role.permissions & permissions) === permissions;
			if (!hasBasePermission)
				throw new ForbiddenError('User does not have enough permissions', {
					details: { user: user.role.permissions, required: permissions }
				});
		}

		if (otherValidations?.length) {
			for (const validation of otherValidations) {
				// validation throws an error if the user is not valid
				validation(user);
			}
		}

		next();
	};
};
