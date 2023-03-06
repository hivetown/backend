import { faker } from '@faker-js/faker';
import { Carrier, OrderItem, Shipment } from '../../entities';
import { generateRandomShipmentEvent } from './shipmentEvent';

export const generateRandomShipment = (orderItems: OrderItem[], carrier: Carrier): Shipment => {
	const shipment = new Shipment();
	// AVOID CIRCULAR DEPENDENCIES
	// shipment.carrier = generateRandomCarrier();
	shipment.carrier = carrier;

	const eventQuantity = faker.datatype.number(3);
	for (let i = 0; i < eventQuantity; i++) {
		shipment.events.add(generateRandomShipmentEvent(shipment));
	}

	for (const orderItem of orderItems) {
		shipment.orderItems.add(orderItem);
	}

	return shipment;
};
