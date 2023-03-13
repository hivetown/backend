import { Collection, Entity, ManyToMany, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import type { Field } from './Field';
import type { Image } from './Image';

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

	@OneToOne()
	public image?: Image;

	public addField(field: Field): void {
		this.fields.add(field);
	}
}
