import { faker } from '@faker-js/faker';
import { Consumer, Order } from '../../entities';
import { generateRandomAddress } from './address';
import { generateRandomOrderItem } from './orderItem';

export const generateRandomOrder = (consumer: Consumer): Order => {
	const order = new Order();
	// AVOID CIRCULAR DEPENDENCIES
	// order.consumer = generateRandomConsumer();
	order.consumer = consumer;

	const itemQuantity = faker.datatype.number(10);
	for (let i = 0; i < itemQuantity; i++) {
		order.items.add(generateRandomOrderItem(order));
	}

	order.shippingAddress = generateRandomAddress();
	return order;
};
