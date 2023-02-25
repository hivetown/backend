import { Collection, Entity, ManyToMany, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Field } from './Field';

@Entity()
export class Category {
	@PrimaryKey()
	id!: number;

	@Property({ type: 'string' })
	name!: string;

	@ManyToOne()
	parent?: Category;

	@ManyToMany()
	fields = new Collection<Field>(this);
}
