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
	public consumer!: Consumer;

	@ManyToOne()
	public shippingAddress!: Address;

	@OneToMany('OrderItem', 'order')
	public items = new Collection<OrderItem>(this);

	public getGeneralStatus(): string {
		const its = this.items.getItems();
		const statuses: number[] = new Array(its.length);
		for (let i = 0; i < its.length; i++) {
			statuses[i] = its[i].getActualStatus();
		}
		return ShipmentStatus[Math.min(...statuses)];
	}

	public getGeneralStatusForProducer(producerId: number) {
		const its = this.items.getItems().filter((item) => item.producerProduct.producer.id === Number(producerId));
		const statuses: number[] = new Array(its.length);
		for (let i = 0; i < its.length; i++) {
			statuses[i] = its[i].getActualStatus();
		}
		return ShipmentStatus[Math.min(...statuses)];
	}
}
