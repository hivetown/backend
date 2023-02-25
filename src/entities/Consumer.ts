import { Collection, Entity, Enum, ManyToMany, OneToMany, OneToOne, PrimaryKey } from '@mikro-orm/core';
import { Address } from './Address';
import { Cart } from './Cart';
import { Order } from './Order';
import { UserType } from '../enums/UserType';
import { User } from './User';

@Entity()
export class Consumer extends User {
	@PrimaryKey()
	id!: number;

	@Enum()
	type = UserType.Consumer;

	@OneToOne()
	cart!: Cart;

	@OneToMany('Order', 'consumer')
	orders = new Collection<Order>(this);

	@ManyToMany()
	addresses = new Collection<Address>(this);
}
