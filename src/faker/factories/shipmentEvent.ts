import { faker } from '@faker-js/faker';
import { ShipmentEvent } from '../../entities';
import { generateRandomShipment } from './shipment';
import { generateRandomAddress } from './address';

export const generateRandomShipmentEvent = (): ShipmentEvent => {
	const shipmentEvent = new ShipmentEvent();
	shipmentEvent.date = faker.date.past();
	shipmentEvent.shipment = generateRandomShipment();
	shipmentEvent.address = generateRandomAddress();
	shipmentEvent.shipmentStatus = generateRandomShipmentStatus();
	return shipmentEvent;
};
