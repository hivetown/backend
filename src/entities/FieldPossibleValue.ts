import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Field } from './Field';

@Entity()
export class FieldPossibleValue {
	@PrimaryKey()
	id!: number;

	@ManyToOne()
	field!: Field;

	@Property({ type: 'string' })
	value!: string;
}
