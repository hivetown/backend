import { faker } from '@faker-js/faker';
import { Cart, Consumer } from '../../entities';
import { generateRandomCartItem } from './cartItem';

export const generateRandomCart = (consumer: Consumer): Cart => {
	const cart = new Cart();
	// AVOID CIRCULAR DEPENDENCIES
	// cart.consumer = generateRandomConsumer();
	cart.consumer = consumer;

	const itemQuantity = faker.datatype.number(10);
	for (let i = 0; i < itemQuantity; i++) {
		cart.items.add(generateRandomCartItem(cart));
	}

	return cart;
};
