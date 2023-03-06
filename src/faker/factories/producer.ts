import { faker } from '@faker-js/faker';
import { Producer } from '../../entities';

export const generateRandomProducer = (): Producer => {
	const producer = new Producer();
	producer.name = faker.company.name();
	producer.email = faker.internet.email(producer.name, '', 'empresa.hivetown.pt');
	producer.phone = Number(faker.phone.number('9########'));
	producer.vat = Number(faker.random.numeric(9));

	const productionUnitQuantity = Number(faker.random.numeric(1));
	for (let i = 0; i < productionUnitQuantity; i++) {
		producer.productionUnits.add(generateRandomProductionUnit());
	}
	return producer;
};
