import { Collection, Entity, ManyToMany, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Field } from './Field';
import type { Image } from './Image';

@Entity()
export class Category {
	@PrimaryKey()
	public id!: number;

	@Property()
	public name!: string;

	@ManyToOne()
	public parent?: Category;

	@ManyToMany(() => Field, (field) => field.categories, { owner: true })
	public fields = new Collection<Field>(this);

	@OneToOne({ eager: true })
	public image?: Image;
}
