import { faker } from '@faker-js/faker';
import { Carrier, ProductionUnit } from '../../entities';
import { CarrierStatus } from '../../enums';
import { generateRandomShipment } from './shipment';

export const generateRandomCarrier = (productionUnit: ProductionUnit): Carrier => {
	const carrier = new Carrier();
	carrier.licensePlate = faker.vehicle.vrm();
	// AVOID CIRCULAR DEPENDENCIES
	// carrier.productionUnit = generateRandomProductionUnit();
	carrier.productionUnit = productionUnit;
	carrier.status = faker.helpers.arrayElement(Object.values(CarrierStatus));

	const shipmentQuantity = faker.datatype.number(23);
	for (let i = 0; i < shipmentQuantity; i++) {
		// TODO: this
		carrier.shipments.add(generateRandomShipment([], carrier));
	}
	return carrier;
};
