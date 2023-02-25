import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Address } from './Address';
import { Carrier } from './Carrier';
import { Producer } from './Producer';
import { ProducerProduct } from './ProducerProduct';

@Entity()
export class ProductionUnit {
	@PrimaryKey()
	public id!: number;

	@Property({ type: 'string' })
	public name!: string;

	@ManyToOne()
	public address!: Address;

	@ManyToOne()
	public producer!: Producer;

	@OneToMany('Carrier', 'productionUnit')
	public carriers = new Collection<Carrier>(this);

	@OneToMany('ProducerProduct', 'productionUnit')
	public products = new Collection<ProducerProduct>(this);
}
