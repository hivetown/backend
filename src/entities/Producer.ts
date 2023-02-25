import { Entity, PrimaryKey, OneToMany, Enum, Collection } from '@mikro-orm/core';
import { User } from './User';
import { UserType } from '../enums/UserType';
import { ProductionUnit } from './ProductionUnit';

@Entity()
export class Producer extends User {
	@PrimaryKey()
	id!: number;

	@Enum()
	type = UserType.Producer;

	@OneToMany('ProductionUnit', 'producer')
	productionUnits = new Collection<ProductionUnit>(this);
}
