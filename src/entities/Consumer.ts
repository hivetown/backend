import { Collection, Entity, OneToMany, OneToOne, Property } from '@mikro-orm/core';
import { UserType } from '../enums/UserType';
import type { Address } from './Address';
import type { Order } from './Order';
import type { CartItem } from './CartItem';
import type { User } from './User';
import { SoftDeletable } from 'mikro-orm-soft-delete';
export { UserType };

@SoftDeletable(() => Consumer, 'deletedAt', () => new Date())
@Entity()
export class Consumer {
	@OneToOne({ primary: true, name: 'id', eager: true })
	public user!: User;

	@OneToMany('CartItem', 'consumer')
	public cartItems = new Collection<CartItem>(this);

	@OneToMany('Order', 'consumer')
	public orders = new Collection<Order>(this);

	@OneToMany('Address', 'consumer')
	public addresses = new Collection<Address>(this);

	@Property({ nullable: true })
	public deletedAt?: Date;

	public existStockCartItems(): boolean {
		return this.cartItems.getItems().every((item) => item.producerProduct.stock >= item.quantity);
	}

	public getProductsOutOfStock(): string {
		return this.cartItems
			.getItems()
			.filter((item) => item.producerProduct.stock < item.quantity)
			.map((item) => item.producerProduct.id)
			.join(', ');
	}
}
