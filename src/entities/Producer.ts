import { Collection, Entity, OneToMany } from '@mikro-orm/core';
import { UserType } from '../types/enums';
import { Product } from './Product';
import { User } from './User';

@Entity()
export class Producer extends User {
	public type = UserType.PRODUCER;

	@OneToMany(() => Product, (product) => product.producer)
	public products = new Collection<Product>(this);
}
