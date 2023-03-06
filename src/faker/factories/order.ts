import { faker } from '@faker-js/faker';
import { Consumer, Order } from '../../entities';
import { generateRandomAddress } from './address';
import { generateRandomOrderItem } from './orderItem';
import { fakerContainer } from '..';

export const generateRandomOrder = (consumer: Consumer): Order => {
	const order = new Order();
	// AVOID CIRCULAR DEPENDENCIES
	// order.consumer = generateRandomConsumer();
	order.consumer = consumer;

	const itemQuantity = faker.datatype.number(10);
	for (let i = 0; i < itemQuantity; i++) {
		const producer = faker.helpers.arrayElement(fakerContainer.randomProducers);
		const productionUnit = faker.helpers.arrayElement(producer.productionUnits.getItems());
		const producerProduct = faker.helpers.arrayElement(productionUnit.products.getItems());
		if (producerProduct) {
			const carrier = faker.helpers.arrayElement(productionUnit.carriers.getItems());
			const shipment = faker.helpers.arrayElement(carrier.shipments.getItems());
			if (shipment) {
				order.items.add(generateRandomOrderItem(order, producerProduct, shipment));
			}
		}
	}

	order.shippingAddress = generateRandomAddress();
	return order;
};
