import { Collection, Entity, ManyToOne, OneToOne, PrimaryKey } from '@mikro-orm/core';
import { CartItem } from './CartItem';
import { Consumer } from './Consumer';

@Entity()
export class Cart {
	@PrimaryKey()
	public id!: number;

	@OneToOne({ inversedBy: 'cart' })
	public consumer!: Consumer;

	@ManyToOne()
	public items = new Collection<CartItem>(this);
}
