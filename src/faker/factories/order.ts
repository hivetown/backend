import { faker } from '@faker-js/faker';
import { Order } from '../../entities';
import { generateRandomConsumer } from './consumer';
import { generateRandomAddress } from './address';

export const generateRandomOrder = (): Order => {
	const order = new Order();
	order.consumer = generateRandomConsumer();
	order.items = generateRandomOrderItems();
	order.shippingAddress = generateRandomAddress();
	return order;
};
