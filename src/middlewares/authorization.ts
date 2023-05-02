import type { NextFunction, Request, Response } from 'express';
import { container } from '..';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import type { User } from '../entities';
import { ForbiddenError } from '../errors/ForbiddenError';
import { Permission, permissionsFromNumber } from '../enums/Permission';
import { NotFoundError } from '../errors/NotFoundError';

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
		if (!user) throw new NotFoundError('Authenticated user not found');

		// Bitwise AND operator to check if the user has the required permission(s)
		if (permissions) {
			const rolePermissions = user.role?.permissions || Permission.NONE;

			const hasBasePermission = (rolePermissions & permissions) === permissions;
			if (!hasBasePermission)
				throw new ForbiddenError('User does not have enough permissions', {
					user: permissionsFromNumber(rolePermissions),
					required: permissionsFromNumber(permissions)
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
