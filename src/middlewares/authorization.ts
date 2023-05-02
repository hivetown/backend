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
type AuthorizationValidation = (user: User, req: Request) => void;

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
		let hasBasePermission = true;
		const rolePermissions = user.role?.permissions || Permission.NONE;
		if (permissions) {
			hasBasePermission = (rolePermissions & permissions) === permissions;
		}

		if (!hasBasePermission && otherValidations?.length) {
			for (const validation of otherValidations) {
				// validation throws an error if the user is not valid
				validation(user, req);
			}
		}

		// need to add "&& permissions" for typescript to be happy
		if (!hasBasePermission && permissions)
			throw new ForbiddenError('User does not have enough permissions', {
				user: permissionsFromNumber(rolePermissions),
				required: permissionsFromNumber(permissions)
			});

		next();
	};
};
