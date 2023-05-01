import { Entity, OneToMany, Collection, OneToOne } from '@mikro-orm/core';
import { User } from './User';
import { UserType } from '../enums/UserType';
import type { ProductionUnit } from './ProductionUnit';
import type { Image } from './Image';
import type { ProducerProduct } from './ProducerProduct';
export { UserType };

@Entity()
export class Producer {
	@OneToOne({ primary: true, name: 'id', eager: true })
	public user!: User;

	@OneToMany('ProductionUnit', 'producer')
	public productionUnits = new Collection<ProductionUnit>(this);

	@OneToMany('ProducerProduct', 'producer')
	public producerProducts = new Collection<ProducerProduct>(this);

	@OneToMany('Image', 'producerImages')
	public imageShowcase = new Collection<Image>(this);
}
