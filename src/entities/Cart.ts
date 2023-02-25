import { Collection, Entity, ManyToOne, OneToOne, PrimaryKey } from '@mikro-orm/core';
import { CartItem } from './CartItem';
import { Consumer } from './Consumer';

@Entity()
export class Cart {
	@PrimaryKey()
	id!: number;

	@OneToOne({ inversedBy: 'cart' })
	consumer!: Consumer;

	@ManyToOne()
	items = new Collection<CartItem>(this);
}
