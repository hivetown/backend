import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey } from '@mikro-orm/core';
import { Address } from './Address';
import { Consumer } from './Consumer';
import type { OrderItem } from './OrderItem';

@Entity()
export class Order {
	@PrimaryKey()
	public id!: number;

	@ManyToOne()
	public consumer?: Consumer;

	@ManyToOne()
	public shippingAddress?: Address;

	@OneToMany('OrderItem', 'order')
	public items = new Collection<OrderItem>(this);
}
