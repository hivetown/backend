import { Entity, Property } from '@mikro-orm/core';

@Entity()
export class Role {
	@Property({ primary: true })
	public id!: number;

	@Property({ unique: true })
	public name!: string;

	// Bitmask permissions
	@Property()
	public permissions!: number;
}
