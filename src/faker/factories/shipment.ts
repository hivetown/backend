import { faker } from '@faker-js/faker';
import { OrderItem, Shipment } from '../../entities';
import { generateRandomCarrier } from './carrier';
import { generateRandomOrderItem } from './orderItem';
import { generateRandomShipmentEvent } from './shipmentEvent';

export const generateRandomShipment = (orderItems: OrderItem[]): Shipment => {
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

	for (const orderItem of orderItems) {
		shipment.products.add(orderItem);
	}

	return shipment;
};
