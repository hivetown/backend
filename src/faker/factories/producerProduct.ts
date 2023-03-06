import { faker } from '@faker-js/faker';
import { ProducerProduct } from '../../entities';
import { generateRandomProducer } from './producer';
import { ProducerProductStatus } from '../../enums';

export const generateRandomProducerProduct = (): ProducerProduct => {
	const producerProduct = new ProducerProduct();
	producerProduct.currentPrice = Number(faker.random.numeric(3));
	producerProduct.productionDate = faker.date.past();
	producerProduct.status = faker.helpers.arrayElement(Object.values(ProducerProductStatus));
	producerProduct.producer = generateRandomProducer();
	producerProduct.productionUnit = generateRandomProductionUnit();
	producerProduct.productSpec = generateRandomProductSpec();
	return producerProduct;
};
