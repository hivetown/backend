import { faker } from '@faker-js/faker';
import { Consumer } from '../../entities';
import { generateRandomAddress } from './address';
import { generateRandomCart } from './cart';

export const generateRandomConsumer = (): Consumer => {
	const consumer = new Consumer();
	const firstName = faker.name.firstName();
	const lastName = faker.name.lastName();
	consumer.name = `${firstName} ${lastName}`;
	consumer.email = faker.internet.email(firstName, lastName, 'hivetown.pt');
	consumer.phone = Number(faker.phone.number('9########'));
	consumer.vat = Number(faker.random.numeric(9));

	const addressQuantity = Number(faker.random.numeric(1));
	for (let i = 0; i < addressQuantity; i++) {
		consumer.addresses.add(generateRandomAddress());
	}

	consumer.orders = generateRandomOrders();
	consumer.cart = generateRandomCart();

	return consumer;
};
