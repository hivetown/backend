import { faker } from '@faker-js/faker';
import { Consumer } from '../../entities';
import { generateRandomAddress } from './address';
import { generateRandomCart } from './cart';
import { generateRandomOrder } from './order';

export const generateRandomConsumer = (): Consumer => {
	const consumer = new Consumer();
	const firstName = faker.name.firstName();
	const lastName = faker.name.lastName();
	consumer.name = `${firstName} ${lastName}`;
	consumer.email = faker.internet.email(firstName, lastName, 'hivetown.pt');
	consumer.phone = Number(faker.phone.number('9########'));
	consumer.vat = Number(faker.phone.number('2########'));

	const addressQuantity = faker.datatype.number(5);
	for (let i = 0; i < addressQuantity; i++) {
		consumer.addresses.add(generateRandomAddress());
	}

	const orderQuantity = faker.datatype.number(50);
	for (let i = 0; i < orderQuantity; i++) {
		consumer.orders.add(generateRandomOrder(consumer));
	}

	consumer.cart = generateRandomCart(consumer);

	return consumer;
};
