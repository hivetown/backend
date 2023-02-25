import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Field } from './Field';

@Entity()
export class FieldPossibleValue {
	@PrimaryKey()
	public id!: number;

	@ManyToOne()
	public field!: Field;

	@Property({ type: 'string' })
	public value!: string;
}
