import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Cart, ProducerProduct } from "../entities";

@Entity()
export class CartItem {

	@PrimaryKey()
	id!: number;

	@Property({ type: 'numeric' })
	quantity!: number;

	@ManyToOne()
	product!: ProducerProduct;

	@ManyToOne()
	cart!: Cart;
}
