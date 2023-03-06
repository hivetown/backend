import { faker } from '@faker-js/faker';
import { Shipment } from '../../entities';
import { generateRandomCarrier } from './carrier';
import { generateRandomOrderItem } from './orderItem';

export const generateRandomShipment = (): Shipment => {
	const shipment = new Shipment();
	shipment.carrier = generateRandomCarrier();

	const orderQuantity = faker.datatype.number(3);
	for (let i = 0; i < orderQuantity; i++) {
		shipment.orders.add(generateRandomOrderItem());
	}

	const eventQuantity = faker.datatype.number(3);
	for (let i = 0; i < eventQuantity; i++) {
		shipment.events.add(generateRandomShipmentEvent());
	}

	const productQuantity = faker.datatype.number(7);
	for (let i = 0; i < productQuantity; i++) {
		shipment.products.add(generateRandomOrderItem());
	}

	return shipment;
};
