import { Collection, Entity, OneToMany, OneToOne } from '@mikro-orm/core';
import { Consumer } from './Consumer';
import type { CartItem } from './CartItem';

@Entity()
export class Cart {
	@OneToOne({ primary: true, inversedBy: 'cart' })
	public consumer!: Consumer;

	@OneToMany('CartItem', 'cart')
	public items = new Collection<CartItem>(this);
}
