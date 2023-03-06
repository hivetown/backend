import { faker } from '@faker-js/faker';
import { Cart, CartItem, ProducerProduct } from '../../entities';

export const generateRandomCartItem = (cart: Cart, producerProduct: ProducerProduct): CartItem => {
	const cartItem = new CartItem();
	// TODO: this
	// AVOID CIRCULAR DEPENDENCIES
	// cartItem.product = generateRandomProducerProduct();
	cartItem.product = producerProduct;
	// AVOID CIRCULAR DEPENDENCIES
	// cartItem.cart = generateRandomCart();
	cartItem.cart = cart;

	cartItem.quantity = faker.datatype.number(10);
	return cartItem;
};
