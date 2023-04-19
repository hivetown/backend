import { Collection, Entity, Enum, ManyToMany, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { FieldType } from '../enums/FieldType';
import { Category } from './Category';
import type { FieldPossibleValue } from './FieldPossibleValue';

@Entity()
export class Field {
	@PrimaryKey()
	public id!: number;

	@Property()
	public name!: string;

	@Property()
	public unit!: string;

	@Enum()
	public type!: FieldType;

	@OneToMany('FieldPossibleValue', 'field')
	public possibleValues = new Collection<FieldPossibleValue>(this);

	@ManyToMany(() => Category, (category) => category.fields)
	public categories = new Collection<Category>(this);
}
