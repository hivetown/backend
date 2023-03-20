import { Collection, Entity, Enum, ManyToMany, OneToMany, OneToOne, PrimaryKey } from '@mikro-orm/core';
import { UserType } from '../enums/UserType';
import { User } from './User';
import type { Address } from './Address';
import type { Order } from './Order';
import type { Image } from './Image';
import type { CartItem } from './CartItem';

@Entity()
export class Consumer extends User {
	@PrimaryKey()
	public id!: number;

	@Enum({ persist: false })
	public type = UserType.Consumer;

	@OneToMany('CartItem', 'consumer')
	public cartItems = new Collection<CartItem>(this);

	@OneToMany('Order', 'consumer')
	public orders = new Collection<Order>(this);

	@ManyToMany()
	public addresses = new Collection<Address>(this);

	@OneToOne()
	public image?: Image;
}
