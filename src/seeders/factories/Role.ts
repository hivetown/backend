import type { EntityManager } from '@mikro-orm/knex';
import { Role } from '../../entities/Role';
import { Permission } from '../../enums/Permission';

const baseRole = [
	{
		name: 'Root',
		permissions: Permission.ALL
	},
	{
		name: 'ContentManager',
		permissions: Permission.ALL_CATEGORY | Permission.ALL_PRODUCT
	},
	{
		name: 'Editor',
		permissions: Permission.WRITE_CATEGORY | Permission.WRITE_PRODUCT
	},
	{
		name: 'AccountManager',
		permissions: Permission.ALL_CONSUMER | Permission.ALL_PRODUCER
	},
	{
		name: 'AccountEditor',
		permissions: Permission.READ_OTHER_CONSUMER | Permission.WRITE_OTHER_CONSUMER
	}
] as Omit<Role, 'id'>[];

export const createRoles = (em: EntityManager) => baseRole.map((role) => em.create(Role, role));
