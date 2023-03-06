import { faker } from '@faker-js/faker';
import { CartItem } from '../../entities';
import { generateRandomCart } from './cart';

export const generateRandomCartItem = (): CartItem => {
	const cartItem = new CartItem();
	cartItem.product = generateRandomProducerProduct();
	cartItem.cart = generateRandomCart();
	cartItem.quantity = Number(faker.random.numeric(2));
	return cartItem;
};
