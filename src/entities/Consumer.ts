import { Collection, Entity, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { UserType } from '../enums/UserType';
import { User } from './User';
import type { Address } from './Address';
import type { Order } from './Order';
import type { Image } from './Image';
import type { CartItem } from './CartItem';
export { UserType };

@Entity()
export class Consumer extends User {
	@PrimaryKey()
	public id!: number;

	@Property({ persist: false })
	public get type() {
		return UserType.Consumer;
	}

	@OneToMany('CartItem', 'consumer')
	public cartItems = new Collection<CartItem>(this);

	@OneToMany('Order', 'consumer')
	public orders = new Collection<Order>(this);

	@OneToMany('Address', 'consumer')
	public addresses = new Collection<Address>(this);

	@OneToOne({ eager: true })
	public image?: Image;

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
