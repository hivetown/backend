import { Collection, Entity, Enum, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { FieldType } from '../enums/FieldType';
import { FieldPossibleValue } from './FieldPossibleValue';

@Entity()
export class Field {
	@PrimaryKey()
	id!: number;

	@Property({ type: 'string' })
	name!: string;

	@Property({ type: 'string' })
	unit!: string;

	@Enum()
	type!: FieldType;

	@OneToMany('FieldPossibleValue', 'field')
	possibleValues = new Collection<FieldPossibleValue>(this);
}
