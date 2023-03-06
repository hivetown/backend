import { faker } from '@faker-js/faker';
import { Cart, Consumer } from '../../entities';
import { generateRandomCartItem } from './cartItem';
import { fakerContainer } from '..';

export const generateRandomCart = (consumer: Consumer): Cart => {
	const cart = new Cart();
	// AVOID CIRCULAR DEPENDENCIES
	// cart.consumer = generateRandomConsumer();
	cart.consumer = consumer;

	const itemQuantity = faker.datatype.number(10);
	for (let i = 0; i < itemQuantity; i++) {
		const producer = faker.helpers.arrayElement(fakerContainer.randomProducers);
		const productionUnit = faker.helpers.arrayElement(producer.productionUnits.getItems());
		const producerProduct = faker.helpers.arrayElement(productionUnit.products.getItems());

		cart.items.add(generateRandomCartItem(cart, producerProduct));
	}

	return cart;
};
