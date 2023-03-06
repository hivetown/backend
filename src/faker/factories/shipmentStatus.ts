import { faker } from '@faker-js/faker';
import { ShipmentStatus } from '../../entities';

export const generateRandomShipmentStatus = (): ShipmentStatus => {
	const shipmentStatus = new ShipmentStatus();
	shipmentStatus.name = faker.random.word();
	shipmentStatus.description = faker.random.words();
	return shipmentStatus;
};
