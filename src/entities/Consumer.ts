import { Collection, Entity, Enum, ManyToMany, OneToMany, OneToOne, PrimaryKey } from '@mikro-orm/core';
import { Address } from './Address';
import { Cart } from './Cart';
import { Order } from './Order';
import { UserType } from '../enums/UserType';
import { User } from './User';

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
