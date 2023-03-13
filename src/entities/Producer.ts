import { Entity, PrimaryKey, OneToMany, Enum, Collection, OneToOne } from '@mikro-orm/core';
import { User } from './User';
import { UserType } from '../enums/UserType';
import type { ProductionUnit } from './ProductionUnit';
import type { Image } from './Image';

@Entity()
export class Producer extends User {
	@PrimaryKey()
	public id!: number;

	@Enum({ persist: false })
	public type = UserType.Producer;

	@OneToMany('ProductionUnit', 'producer')
	public productionUnits = new Collection<ProductionUnit>(this);

	@OneToOne()
	public image?: Image;

	@OneToMany('Image', 'producer')
	public images = new Collection<Image>(this);

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
