import { Collection, Entity, OneToMany, OneToOne, Property } from '@mikro-orm/core';
import { UserType } from '../enums/UserType';
import type { Address } from './Address';
import type { Order } from './Order';
import type { CartItem } from './CartItem';
import type { User } from './User';
export { UserType };

@Entity()
export class Consumer {
	@OneToOne({ primary: true })
	public user!: User;

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
