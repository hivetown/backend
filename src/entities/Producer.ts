import { Entity, PrimaryKey, OneToMany, Enum, Collection } from '@mikro-orm/core';
import { User } from './User';
import { UserType } from '../enums/UserType';
import type { ProductionUnit } from './ProductionUnit';

@Entity()
export class Producer extends User {
	@PrimaryKey()
	public id!: number;

	@Enum()
	public type = UserType.Producer;

	@OneToMany('ProductionUnit', 'producer')
	public productionUnits = new Collection<ProductionUnit>(this);

	public getId(): number {
		return this.id;
	}

	public getType(): UserType {
		return this.type;
	}

	public getProductionUnits(): Collection<ProductionUnit> {
		return this.productionUnits;
	}

	public toString(): string {
		return `Producer ${this.name} (id=${this.getId()}, type=${this.getType()})`;
	}
}
