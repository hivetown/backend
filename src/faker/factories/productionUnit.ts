import { faker } from '@faker-js/faker';
import { Producer, ProductionUnit } from '../../entities';
import { generateRandomAddress } from './address';
import { generateRandomCarrier } from './carrier';
import { generateRandomProducerProduct } from './producerProduct';
import { fakerContainer } from '..';

export const generateRandomProductionUnit = (producer: Producer): ProductionUnit => {
	const productionUnit = new ProductionUnit();
	productionUnit.name = faker.company.name();
	productionUnit.address = generateRandomAddress();
	// AVOID CIRCULAR DEPENDENCIES
	// productionUnit.producer = generateRandomProducer();
	productionUnit.producer = producer;

	const carrierQuantity = faker.datatype.number(7);
	for (let i = 0; i < carrierQuantity; i++) {
		productionUnit.carriers.add(generateRandomCarrier(productionUnit));
	}

	const productsQuantity = faker.datatype.number(70);
	for (let i = 0; i < productsQuantity; i++) {
		productionUnit.products.add(
			generateRandomProducerProduct(productionUnit.producer, productionUnit, faker.helpers.arrayElement(fakerContainer.randomProductSpecs))
		);
	}

	return productionUnit;
};
