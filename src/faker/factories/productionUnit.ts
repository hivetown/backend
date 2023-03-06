import { faker } from '@faker-js/faker';
import { ProductionUnit } from '../../entities';
import { generateRandomAddress } from './address';
import { generateRandomProducer } from './producer';
import { generateRandomCarrier } from './carrier';
import { generateRandomProducerProduct } from './producerProduct';

export const generateRandomProductionUnit = (): ProductionUnit => {
	const productionUnit = new ProductionUnit();
	productionUnit.name = faker.company.name();
	productionUnit.address = generateRandomAddress();
	productionUnit.producer = generateRandomProducer();

	const carrierQuantity = faker.datatype.number(7);
	for (let i = 0; i < carrierQuantity; i++) {
		productionUnit.carriers.add(generateRandomCarrier(productionUnit));
	}

	const productsQuantity = faker.datatype.number(70);
	for (let i = 0; i < productsQuantity; i++) {
		productionUnit.products.add(generateRandomProducerProduct());
	}

	return productionUnit;
};
