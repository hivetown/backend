import { Cart } from '../../entities';

export const generateRandomCart = (): Cart => {
	const cart = new Cart();
	cart.consumer = generateRandomConsumer();
	cart.items = generateRandomCartItems();
	return cart;
};
