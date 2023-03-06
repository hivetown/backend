import { faker } from '@faker-js/faker';
import { Producer } from '../../entities';
import { generateRandomProductionUnit } from './productionUnit';

export const generateRandomProducer = (): Producer => {
	const producer = new Producer();
	producer.name = faker.company.name();
	producer.email = faker.internet.email(producer.name, '', 'empresa.hivetown.pt');
	producer.phone = Number(faker.phone.number('9########'));
	producer.vat = Number(faker.phone.number('2########'));

	const productionUnitQuantity = faker.datatype.number(19);
	for (let i = 0; i < productionUnitQuantity; i++) {
		producer.productionUnits.add(generateRandomProductionUnit());
	}
	return producer;
};
