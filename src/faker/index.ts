import { faker } from '@faker-js/faker';
import { generateRandomProductSpec } from './factories/productSpec';
import type { Consumer, Producer, ProductSpec } from '../entities';
import { generateRandomConsumer } from './factories/consumer';
import { generateRandomProducer } from './factories/producer';

export const fakerContainer: {
	randomProductSpecs: ProductSpec[];
	randomProducers: Producer[];
	randomConsumers: Consumer[];
} = {
	randomProductSpecs: [],
	randomProducers: [],
	randomConsumers: []
};

export const initFaker = () => {
	const productSpecQuantity = 1 || faker.datatype.number(200);

	for (let i = 0; i < productSpecQuantity; i++) {
		fakerContainer.randomProductSpecs.push(generateRandomProductSpec());
	}

	const producersQuantity = 1 || faker.datatype.number(200);
	for (let i = 0; i < producersQuantity; i++) {
		fakerContainer.randomProducers.push(generateRandomProducer());
	}

	const consumerQuantity = 1 || faker.datatype.number(200);
	for (let i = 0; i < consumerQuantity; i++) {
		fakerContainer.randomConsumers.push(generateRandomConsumer());
	}
};
