import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Address } from './Address';
import { Carrier } from './Carrier';
import { Producer } from './Producer';
import { ProducerProduct } from './ProducerProduct';

@Entity()
export class ProductionUnit {
	@PrimaryKey()
	id!: number;

	@Property({ type: 'string' })
	name!: string;

	@ManyToOne()
	address!: Address;

	@ManyToOne()
	producer!: Producer;

	@OneToMany('Carrier', 'productionUnit')
	carriers = new Collection<Carrier>(this);

	@OneToMany('ProducerProduct', 'productionUnit')
	products = new Collection<ProducerProduct>(this);
}
