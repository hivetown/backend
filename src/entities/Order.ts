import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey } from '@mikro-orm/core';
import { ShipmentStatus } from '../enums';
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

	public getGeneralStatus(): string {
		const statuses: number[] = [];
		for (const i of this.items.getItems()) {
			statuses.push(i.getActualStatus());
		}
		return ShipmentStatus[Math.min(...statuses)];
	}
}
