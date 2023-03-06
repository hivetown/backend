import { faker } from '@faker-js/faker';
import { Carrier, ProductionUnit } from '../../entities';
import { CarrierStatus } from '../../enums';

export const generateRandomCarrier = (productionUnit: ProductionUnit): Carrier => {
	const carrier = new Carrier();
	carrier.licensePlate = faker.vehicle.vrm();
	// AVOID CIRCULAR DEPENDENCIES
	// carrier.productionUnit = generateRandomProductionUnit();
	carrier.productionUnit = productionUnit;
	carrier.status = faker.helpers.arrayElement(Object.values(CarrierStatus));
	return carrier;
};
