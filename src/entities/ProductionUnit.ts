import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Address } from './Address';
import { Producer } from './Producer';
import type { ProducerProduct } from './ProducerProduct';
import type { Carrier } from './Carrier';
import type { Image } from './Image';

@Entity()
export class ProductionUnit {
	@PrimaryKey()
	public id!: number;

	@Property()
	public name!: string;

	@ManyToOne()
	public address!: Address;

	@ManyToOne()
	public producer!: Producer;

	@OneToMany('Carrier', 'productionUnit')
	public carriers = new Collection<Carrier>(this);

	@OneToMany('ProducerProduct', 'productionUnit')
	public products = new Collection<ProducerProduct>(this);

	@OneToMany('Image', 'productionUnit')
	public images = new Collection<Image>(this);

	public constructor(name: string, address: Address, producer: Producer) {
		this.name = name;
		this.address = address;
		this.producer = producer;
	}
}
