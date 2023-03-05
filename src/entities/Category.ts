import { Collection, Entity, ManyToMany, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import type { Field } from './Field';

@Entity()
export class Category {
	@PrimaryKey()
	public id!: number;

	@Property()
	public name!: string;

	@ManyToOne()
	public parent?: Category;

	@ManyToMany()
	public fields = new Collection<Field>(this);
}
