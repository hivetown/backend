import { Entity, PrimaryKey, OneToMany, Collection, OneToOne, Property } from '@mikro-orm/core';
import { User } from './User';
import { UserType } from '../enums/UserType';
import type { ProductionUnit } from './ProductionUnit';
import type { Image } from './Image';
import type { ProducerProduct } from './ProducerProduct';
export { UserType };

@Entity()
export class Producer extends User {
	@PrimaryKey()
	public id!: number;

	@Property({ persist: false })
	public get type() {
		return UserType.Producer;
	}

	@OneToMany('ProductionUnit', 'producer')
	public productionUnits = new Collection<ProductionUnit>(this);

	@OneToMany('ProducerProduct', 'producer')
	public producerProducts = new Collection<ProducerProduct>(this);

	@OneToOne({ eager: true })
	public image?: Image;

	@OneToMany('Image', 'producerImages', { eager: true })
	public images = new Collection<Image>(this);
}
