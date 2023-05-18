import type { User } from '../entities';
import { Permission } from '../enums/Permission';

export const hasPermissions = (user: User, permissions: number) => {
	return ((user.role?.permissions || Permission.NONE) & permissions) === permissions;
};
