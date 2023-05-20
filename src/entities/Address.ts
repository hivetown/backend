import { Entity, Property, PrimaryKey, ManyToOne } from '@mikro-orm/core';
import type { Consumer } from './Consumer';

@Entity()
export class Address {
	@PrimaryKey()
	public id!: number;

	@Property({ type: 'int' })
	public number!: number;

	@Property()
	public door!: string;

	@Property({ type: 'int' })
	public floor!: number;

	@Property()
	public zipCode!: string;

	@Property()
	public street!: string;

	@Property()
	public parish!: string;

	@Property()
	public county!: string;

	@Property()
	public city!: string;

	@Property()
	public district!: string;

	@Property({ type: 'double' })
	public latitude!: number;

	@Property({ type: 'double' })
	public longitude!: number;

	@ManyToOne({ hidden: true })
	public consumer?: Consumer;

	@Property({ persist: false })
	public getFullAddress(): string {
		return `${this.street}, ${this.number} ${this.floor}${` - ${this.door}`}, ${this.zipCode} ${this.parish}, ${this.county}, ${this.city}, ${
			this.district
		}`;
	}

	@Property({ persist: false })
	public getShortAddress(): string {
		return `${this.parish}, ${this.county}, ${this.city}`;
	}
}
