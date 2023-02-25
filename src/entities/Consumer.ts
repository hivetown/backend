import { Collection, Entity, Enum, ManyToMany, OneToMany, OneToOne, PrimaryKey } from '@mikro-orm/core';
import { Cart } from './Cart';
import { UserType } from '../enums/UserType';
import { User } from './User';
import type { Address } from './Address';
import type { Order } from './Order';

@Entity()
export class Consumer extends User {
	@PrimaryKey()
	public id!: number;

	@Enum()
	public type = UserType.Consumer;

	@OneToOne()
	public cart!: Cart;

	@OneToMany('Order', 'consumer')
	public orders = new Collection<Order>(this);

	@ManyToMany()
	public addresses = new Collection<Address>(this);
}
