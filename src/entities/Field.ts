import { Collection, Entity, Enum, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { FieldType } from '../enums/FieldType';
import type { FieldPossibleValue } from './FieldPossibleValue';

@Entity()
export class Field {
	@PrimaryKey()
	public id!: number;

	@Property({ type: 'string' })
	public name!: string;

	@Property({ type: 'string' })
	public unit!: string;

	@Enum()
	public type!: FieldType;

	@OneToMany('FieldPossibleValue', 'field')
	public possibleValues = new Collection<FieldPossibleValue>(this);
}
