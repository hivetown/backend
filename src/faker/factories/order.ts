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
		if (!producer) continue;
		const productionUnit = faker.helpers.arrayElement(producer.productionUnits.getItems());
		if (!productionUnit) continue;
		const producerProduct = faker.helpers.arrayElement(productionUnit.products.getItems());
		if (!producerProduct) continue;
		const carrier = faker.helpers.arrayElement(productionUnit.carriers.getItems());
		if (!carrier) continue;
		const shipment = faker.helpers.arrayElement(carrier.shipments.getItems());
		if (!shipment) continue;

		order.items.add(generateRandomOrderItem(order, producerProduct, shipment));
	}

	order.shippingAddress = generateRandomAddress();
	return order;
};
