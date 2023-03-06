import { faker } from '@faker-js/faker';
import { Shipment, ShipmentEvent } from '../../entities';
import { generateRandomAddress } from './address';
import { generateRandomShipmentStatus } from './shipmentStatus';

export const generateRandomShipmentEvent = (shipment: Shipment): ShipmentEvent => {
	const shipmentEvent = new ShipmentEvent();
	shipmentEvent.date = faker.date.past();
	// AVOID CIRCULAR DEPENDENCIES
	// shipmentEvent.shipment = generateRandomShipment();
	shipmentEvent.shipment = shipment;
	shipmentEvent.address = generateRandomAddress();
	shipmentEvent.shipmentStatus = generateRandomShipmentStatus();
	return shipmentEvent;
};
