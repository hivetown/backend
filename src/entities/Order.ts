import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { ShipmentStatus } from '../enums';
import { Address } from './Address';
import { Consumer } from './Consumer';
import { OrderItem } from './OrderItem';
import { ShipmentEvent } from './ShipmentEvent';

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

	@Property({ nullable: true, unique: true })
	public payment?: string;

	public create(consumer: Consumer, shippingAddress: Address): Order {
		this.consumer = consumer;
		this.shippingAddress = shippingAddress;
		for (const item of consumer.cartItems.getItems()) {
			this.items.add(new OrderItem().create(this, item.producerProduct, item.quantity));
		}
		return this;
	}

	public canCancel(): boolean {
		for (const i of this.items.getItems()) {
			const actualStatus = i.getActualStatus();
			if (actualStatus > ShipmentStatus.Processing || actualStatus === ShipmentStatus.Canceled) {
				return false;
			}
		}
		return true;
	}

	public getGeneralStatus(): string {
		const its = this.items.getItems();
		const statuses: number[] = new Array(its.length);
		for (let i = 0; i < its.length; i++) {
			statuses[i] = its[i].getActualStatus();
		}

		if (statuses.includes(ShipmentStatus.Canceled)) {
			return ShipmentStatus[ShipmentStatus.Canceled];
		}
		return ShipmentStatus[Math.min(...statuses)];
	}

	public getGeneralStatusForProducer(producerId: number) {
		const its = this.items.getItems().filter((item) => item.producerProduct.producer.user.id === Number(producerId));
		const statuses: number[] = new Array(its.length);
		for (let i = 0; i < its.length; i++) {
			statuses[i] = its[i].getActualStatus();
		}

		if (statuses.includes(ShipmentStatus.Canceled)) {
			return ShipmentStatus[ShipmentStatus.Canceled];
		}
		return ShipmentStatus[Math.min(...statuses)];
	}

	public getTotalPrice(): number {
		let total = 0;
		for (const i of this.items.getItems()) {
			total += i.price * i.quantity;
		}
		return total;
	}

	public getOrderDate(): Date {
		return this.items.getItems()[0].shipment.getFirstEvent().date;
	}

	public addShipmentEvent(status: ShipmentStatus, address: Address) {
		this.items.getItems().forEach((item) => {
			item.shipment.events.add(new ShipmentEvent().create(item.shipment, status, address));
		});
	}
}
