import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey } from '@mikro-orm/core';
import { Address } from './Address';
import { Consumer } from './Consumer';
import { OrderItem } from './OrderItem';

@Entity()
export class Order {
	@PrimaryKey()
	id!: number;

	@ManyToOne()
	consumer?: Consumer;

	@ManyToOne()
	shippingAddress?: Address;

	@OneToMany('OrderItem', 'order')
	items = new Collection<OrderItem>(this);
}
