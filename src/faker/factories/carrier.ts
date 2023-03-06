import { faker } from '@faker-js/faker';
import { Carrier } from '../../entities';
import { CarrierStatus } from '../../enums';

export const generateRandomCarrier = (): Carrier => {
	const carrier = new Carrier();
	carrier.licensePlate = faker.vehicle.vrm();
	carrier.productionUnit = generateRandomProductionUnit();
	carrier.status = faker.helpers.arrayElement(Object.values(CarrierStatus));
	return carrier;
};
