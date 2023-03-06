import { faker } from '@faker-js/faker';
import { Cart, CartItem } from '../../entities';
import { generateRandomProducerProduct } from './producerProduct';

export const generateRandomCartItem = (cart: Cart): CartItem => {
	const cartItem = new CartItem();
	cartItem.product = generateRandomProducerProduct();
	// AVOID CIRCULAR DEPENDENCIES
	// cartItem.cart = generateRandomCart();
	cartItem.cart = cart;

	cartItem.quantity = faker.datatype.number(10);
	return cartItem;
};
